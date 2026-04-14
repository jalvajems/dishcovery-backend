import { injectable, inject } from 'inversify';
import Stripe from 'stripe';
import TYPES from '../../DI/types';
import { IBookingService } from '../interface/IBookingService';
import { IBookingRepository } from '../../repostories/interface/IBookingRepository';
import { IWorkshopRepository } from '../../repostories/interface/IWorkshopRepository';
import { IStripeService } from '../interface/IStripeService';
import { IBookingDocument, BookingStatus, BookingType } from '../../types/booking.types';
import { IBookingDto } from '../../dtos/booking.dtos';
import { bookingMapper, allBookingsMapper } from '../../utils/mapper/booking.mapper';
import { WorkshopStatus, WorkshopMode } from '../../types/workshop.types';
import { AppError } from '../../utils/AppError';
import { Types } from 'mongoose';
import { ITransactionRepository } from '../../repostories/interface/ITransactionRepository';
import { WalletTransactionStatus, WalletTransactionType } from '../../models/transaction.model';
import { Role } from '../../types/user.types';
import { BOOKING_MESSAGES, MESSAGES, WORKSHOP_MESSAGES } from '../../constants/Message';
import { STATUS_CODE } from '../../constants/StatusCode';

@injectable()
export class BookingService implements IBookingService {
    constructor(
        @inject(TYPES.IBookingRepository) private bookingRepository: IBookingRepository,
        @inject(TYPES.IWorkshopRepository) private workshopRepository: IWorkshopRepository,
        @inject(TYPES.IStripeService) private stripeService: IStripeService,
        @inject(TYPES.ITransactionRepository) private _transactionRepository: ITransactionRepository,
    ) { }

    async createBooking(workshopId: string, foodieId: string, ticketCount: number = 1): Promise<{ booking: IBookingDto; clientSecret?: string }> {
        const workshop = await this.workshopRepository.findById(workshopId);

        if (!workshop) {
            throw new AppError(WORKSHOP_MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);
        }

        const allowedStatuses = [WorkshopStatus.APPROVED, WorkshopStatus.UPCOMING];
        if (!allowedStatuses.includes(workshop.status)) {
            throw new AppError(`Workshop is not bookable. Current status: ${workshop.status}`, STATUS_CODE.CONFLICT);
        }

        if (workshop.mode === WorkshopMode.ONLINE) {
            ticketCount = 1;
        } else {
            if (ticketCount < 1 || ticketCount > 5) {
                throw new AppError('Ticket count must be between 1 and 5 for offline workshops', STATUS_CODE.BAD_REQUEST);
            }
        }

        if (workshop.participantsCount + ticketCount > workshop.participantLimit) {
            throw new AppError('Not enough spots available', STATUS_CODE.BAD_REQUEST);
        }

        const workshopDate = new Date(workshop.date);
        const [hours, minutes] = workshop.startTime.split(':').map(Number);
        workshopDate.setHours(hours, minutes, 0, 0);

        const oneHourBeforeStart = new Date(workshopDate.getTime() - 60 * 60 * 1000);
        const now = new Date();

        if (now > oneHourBeforeStart) {
            throw new AppError('Bookings are closed 1 hour before the session starts', STATUS_CODE.BAD_REQUEST);
        }

        const existingBooking = await this.bookingRepository.findByWorkshopAndFoodie(workshopId, foodieId);

        const retryableStatuses = [
            BookingStatus.CANCELLED,
            BookingStatus.REFUNDED,
            BookingStatus.CANCELLED_BY_FOODIE,
            BookingStatus.CANCELLED_BY_CHEF,
            BookingStatus.PENDING
        ];

        if (existingBooking && !retryableStatuses.includes(existingBooking.status)) {

            throw new AppError('You have already booked this workshop', STATUS_CODE.CONFLICT);
        }

        const totalAmount = workshop.price * ticketCount;

        if (workshop.isFree) {
            const bookingData: Partial<IBookingDocument> = {
                workshopId: new Types.ObjectId(workshopId),
                foodieId: new Types.ObjectId(foodieId),
                status: BookingStatus.CONFIRMED,
                bookingType: BookingType.FREE,
                ticketCount: ticketCount,
                amount: 0,
                bookedAt: new Date(),
                cancelledAt: undefined,
                cancellationReason: undefined,
                refundId: undefined
            };

            let booking;
            if (existingBooking) {

                booking = await this.bookingRepository.updateStatus(
                    existingBooking._id as string,
                    BookingStatus.CONFIRMED,
                    {
                        ...bookingData,
                        paymentIntentId: undefined,
                        stripeEventId: undefined
                    }
                );
            } else {
                booking = await this.bookingRepository.create(bookingData as Partial<IBookingDocument>);
            }

            if (booking) {
                await this.workshopRepository.incrementParticipants(workshopId, ticketCount);
            }

            return { booking: bookingMapper(booking!) };
        }

        let booking: IBookingDocument;
        let clientSecret: string;

        if (existingBooking) {
            const paymentIntent = await this.stripeService.createPaymentIntent(totalAmount, {
                workshopId,
                bookingId: (existingBooking._id as string).toString(),
                foodieId
            });

            const updatedBooking = await this.bookingRepository.updateStatus(
                existingBooking._id as string,
                BookingStatus.PENDING,
                {
                    status: BookingStatus.PENDING,
                    bookingType: BookingType.PAID,
                    ticketCount: ticketCount,
                    amount: totalAmount,
                    bookedAt: new Date(),
                    cancelledAt: undefined,
                    cancellationReason: undefined,
                    refundId: undefined,
                    stripeEventId: undefined,
                    paymentIntentId: paymentIntent.id
                } as unknown as Partial<IBookingDocument>
            );
            booking = updatedBooking!;
            clientSecret = paymentIntent.client_secret || '';

        } else {
            const bookingData = {
                workshopId: new Types.ObjectId(workshopId),
                foodieId: new Types.ObjectId(foodieId),
                status: BookingStatus.PENDING,
                bookingType: BookingType.PAID,
                ticketCount: ticketCount,
                isbooking:true,
                amount: totalAmount,
                bookedAt: new Date()
            };

            booking = await this.bookingRepository.create(bookingData);

            const paymentIntent = await this.stripeService.createPaymentIntent(totalAmount, {
                workshopId,
                bookingId: (booking._id as string).toString(),
                foodieId
            });

            await this.bookingRepository.updateStatus(booking._id as string, BookingStatus.PENDING, {
                paymentIntentId: paymentIntent.id
            });

            clientSecret = paymentIntent.client_secret || '';
        }

        return {
            booking: bookingMapper(booking),
            clientSecret: clientSecret || undefined
        };
    }


    async handleStripeWebhook(payload: string | Buffer, signature: string): Promise<void> {
        console.log('in handle strpewebhook');

        const event = this.stripeService.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        if (event.type === 'payment_intent.succeeded') {
            console.log('in handle strpewebhook succes case');
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const booking = await this.bookingRepository.findByPaymentIntentId(paymentIntent.id);
            if (!booking) return;
            if (booking && booking.status === BookingStatus.PENDING) {
                await this.bookingRepository.updateStatus(booking._id as string, BookingStatus.CONFIRMED, {
                    stripeEventId: event.id
                });

                // Better approach:
                let wId: string;
                if (booking.workshopId instanceof Types.ObjectId) {
                    wId = booking.workshopId.toString();
                } else if (typeof booking.workshopId === 'string') {
                    wId = booking.workshopId;
                } else {
                    // It's a populated document
                    wId = (booking.workshopId as unknown as { _id: Types.ObjectId })._id.toString();
                }

                console.log('workshopid', wId);

                await this.workshopRepository.incrementParticipants(wId, booking.ticketCount || 1);
            }
            console.log('creating transaction');

            await this._transactionRepository.create({
                userId: booking.foodieId,
                role: Role.USER,
                bookingId: booking.id,
                workshopId: booking.workshopId,
                amount: booking.amount,
                type: WalletTransactionType.DEBIT,
                status: WalletTransactionStatus.SUCCESS,
                stripePaymentIntentId: paymentIntent.id,
                stripeEventId: event.id,
                description: 'Workshop booking payment'

            })
            const workshop = await this.workshopRepository.findById(booking.workshopId);

            await this._transactionRepository.create({
                userId: workshop!.chefId,
                role: Role.CHEF,
                bookingId: booking.id,
                workshopId: booking.workshopId,
                amount: booking.amount,
                type: WalletTransactionType.CREDIT,
                status: WalletTransactionStatus.SUCCESS,
                stripePaymentIntentId: paymentIntent.id,
                stripeEventId: event.id,
                description: 'Earning from workshop booking'

            })

        }
        else if (event.type === 'payment_intent.payment_failed') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const booking = await this.bookingRepository.findByPaymentIntentId(paymentIntent.id);

            if (booking && booking.status === BookingStatus.PENDING) {
                await this.bookingRepository.updateStatus(booking._id as string, BookingStatus.CANCELLED);
            }
        }
        else if (event.type === 'charge.refunded') {
            console.log('handling charge.refunded event');
            const refund = event.data.object as Stripe.Charge;
            const paymentIntentId = refund.payment_intent as string;

            const booking = await this.bookingRepository.findByPaymentIntentId(paymentIntentId);
            if (!booking) {
                console.error(`Booking not found for payment intent: ${paymentIntentId}`);
                return;
            }

            if (booking.status === BookingStatus.REFUNDED) return;

            await this.bookingRepository.updateStatus(booking._id as string, BookingStatus.REFUNDED, {
                refundId: refund.id
            });

            await this._transactionRepository.create({
                userId: booking.foodieId,
                role: Role.USER,
                bookingId: booking._id as string,
                workshopId: booking.workshopId,
                amount: refund.amount / 100,
                type: WalletTransactionType.REFUND,
                status: WalletTransactionStatus.SUCCESS,
                stripePaymentIntentId: paymentIntentId,
                stripeEventId: event.id,
                description: 'Refund for workshop booking'
            });

            const workshop = await this.workshopRepository.findById(booking.workshopId);
            if (workshop) {
                await this._transactionRepository.create({
                    userId: workshop.chefId,
                    role: Role.CHEF,
                    bookingId: booking._id as string,
                    workshopId: booking.workshopId,
                    amount: refund.amount / 100,
                    type: WalletTransactionType.REFUND,
                    status: WalletTransactionStatus.SUCCESS,
                    stripePaymentIntentId: paymentIntentId,
                    stripeEventId: event.id,
                    description: 'Refund deduction for cancelled booking'
                });
            }
        }
    }

    async getMyBookings(foodieId: string): Promise<IBookingDto[]> {
        const bookings = await this.bookingRepository.findByFoodieId(foodieId);
        return allBookingsMapper(bookings);
    }

    async getWorkshopParticipants(workshopId: string, chefId: string): Promise<IBookingDto[]> {
        const workshop = await this.workshopRepository.findById(workshopId);
        if (!workshop) throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);

        if (workshop.chefId.toString() !== chefId) {
            throw new AppError('Access denied: You are not the host of this workshop', STATUS_CODE.FORBIDDEN);
        }

        const bookings = await this.bookingRepository.findByWorkshopId(workshopId);
        return allBookingsMapper(bookings);
    }

    async cancelBooking(bookingId: string, foodieId: string): Promise<void> {
        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) throw new AppError(BOOKING_MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);

        if (booking.foodieId.toString() !== foodieId) {
            throw new AppError(MESSAGES.AUTH.ACCESS_DENIED, STATUS_CODE.FORBIDDEN);
        }

        if (booking.status !== BookingStatus.CONFIRMED) {
            throw new AppError('Only confirmed bookings can be cancelled', STATUS_CODE.BAD_REQUEST);
        }

        const workshop = await this.workshopRepository.findById(booking.workshopId);
        if (!workshop) throw new AppError(WORKSHOP_MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);

        if (workshop.status === WorkshopStatus.LIVE || workshop.status === WorkshopStatus.COMPLETED) {
            throw new AppError('Cannot cancel booking for a live or completed workshop', STATUS_CODE.BAD_REQUEST);
        }

        if (booking.bookingType === BookingType.FREE) {
            await this.bookingRepository.updateStatus(bookingId, BookingStatus.CANCELLED_BY_FOODIE, {
                cancelledAt: new Date(),
                cancellationReason: 'Cancelled by Foodie'
            });
            await this.workshopRepository.decrementParticipants(workshop._id as string, booking.ticketCount || 1);
        } else {
            if (!booking.paymentIntentId) {
                throw new AppError('Payment information missing for paid booking', STATUS_CODE.INTERNAL_SERVER_ERROR);
            }

            try {
                await this.stripeService.createRefund(booking.paymentIntentId);

                await this.bookingRepository.updateStatus(bookingId, BookingStatus.CANCELLED_BY_FOODIE, {
                    cancelledAt: new Date(),
                    cancellationReason: 'Cancelled by Foodie'
                });

                await this.workshopRepository.decrementParticipants(workshop._id as string, booking.ticketCount || 1);

            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error during refund';
                throw new AppError(`Refund failed: ${errorMessage}`, STATUS_CODE.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async processWorkshopCancellation(workshopId: string, reason: string = 'Workshop cancelled by Chef'): Promise<void> {
        const bookings = await this.bookingRepository.findByWorkshopId(workshopId);

        for (const booking of bookings) {
            if (booking.status === BookingStatus.CANCELLED ||
                booking.status === BookingStatus.CANCELLED_BY_FOODIE ||
                booking.status === BookingStatus.CANCELLED_BY_CHEF ||
                booking.status === BookingStatus.REFUNDED) {
                continue;
            }

            if (booking.bookingType === BookingType.FREE) {
                await this.bookingRepository.updateStatus(booking._id as string, BookingStatus.CANCELLED_BY_CHEF, {
                    cancelledAt: new Date(),
                    cancellationReason: reason
                });
            } else {
                if (booking.paymentIntentId) {
                    try {
                        await this.stripeService.createRefund(booking.paymentIntentId);

                        await this.bookingRepository.updateStatus(booking._id as string, BookingStatus.CANCELLED_BY_CHEF, {
                            cancelledAt: new Date(),
                            cancellationReason: reason
                        });
                    } catch (error) {
                        console.error(`Failed to refund booking ${booking._id}:`, error);
                        await this.bookingRepository.updateStatus(booking._id as string, BookingStatus.CANCELLED_BY_CHEF, {
                            cancelledAt: new Date(),
                            cancellationReason: `${reason} (Refund Failed - Contact Support)`
                        });
                    }
                }
            }
        }
    }

    async markAttendance(bookingId: string, status: string): Promise<IBookingDto> {
        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) throw new AppError(BOOKING_MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);



        const updatedBooking = await this.bookingRepository.updateAttendance(bookingId, status);
        if (!updatedBooking) throw new AppError('Failed to update attendance', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return bookingMapper(updatedBooking);
    }
}
