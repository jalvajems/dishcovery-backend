import { injectable, inject } from 'inversify';
import TYPES from '../../DI/types';
import { IBookingService } from '../interface/IBookingService';
import { IBookingRepository } from '../../repostories/interface/IBookingRepository';
import { IWorkshopRepository } from '../../repostories/interface/IWorkshopRepository';
import { IStripeService } from '../interface/IStripeService';
import { IBookingDocument, BookingStatus, BookingType } from '../../types/booking.types';
import { WorkshopStatus, WorkshopMode } from '../../types/workshop.types';
import { AppError } from '../../utils/AppError';
import { Types } from 'mongoose';
import { ITransactionRepository } from '../../repostories/interface/ITransactionRepository';
import { WalletTransactionStatus, WalletTransactionType } from '../../models/transaction.model';
import { Role } from '../../types/user.types';

@injectable()
export class BookingService implements IBookingService {
    constructor(
        @inject(TYPES.IBookingRepository) private bookingRepository: IBookingRepository,
        @inject(TYPES.IWorkshopRepository) private workshopRepository: IWorkshopRepository,
        @inject(TYPES.IStripeService) private stripeService: IStripeService,
        @inject(TYPES.ITransactionRepository) private _transactionRepository: ITransactionRepository,
    ) { }

    async createBooking(workshopId: string, foodieId: string, ticketCount: number = 1): Promise<{ booking: IBookingDocument; clientSecret?: string }> {
        const workshop = await this.workshopRepository.findById(workshopId);

        if (!workshop) {
            throw new AppError('Workshop not found', 404);
        }

        const allowedStatuses = [WorkshopStatus.APPROVED, WorkshopStatus.UPCOMING];
        if (!allowedStatuses.includes(workshop.status)) {
            throw new AppError(`Workshop is not bookable. Current status: ${workshop.status}`, 409);
        }

        if (workshop.mode === WorkshopMode.ONLINE) {
            ticketCount = 1;
        } else {
            if (ticketCount < 1 || ticketCount > 5) {
                throw new AppError('Ticket count must be between 1 and 5 for offline workshops', 400);
            }
        }

        if (workshop.participantsCount + ticketCount > workshop.participantLimit) {
            throw new AppError('Not enough spots available', 400);
        }

        const workshopDate = new Date(workshop.date);
        const [hours, minutes] = workshop.startTime.split(':').map(Number);
        workshopDate.setHours(hours, minutes, 0, 0);

        const oneHourBeforeStart = new Date(workshopDate.getTime() - 60 * 60 * 1000);
        const now = new Date();

        if (now > oneHourBeforeStart) {
            throw new AppError('Bookings are closed 1 hour before the session starts', 400);
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
            // allow booking again if existing booking is cancelled ? No existing logic seems to prevent multiple bookings if not caught by index, 
            // but we have unique index on workshopId + foodieId.
            // Requirement is just "select upto 5 slots". Assuming this means per booking or total? 
            // "if the session is offline the foodie can select upto 5 slots"
            // If they already have a booking, we should probably block or update? 
            // The current unique index prevents multiple documents. 
            // We'll stick to blocking if already booked as per existing logic.
            throw new AppError('You have already booked this workshop', 409);
        }

        const totalAmount = workshop.price * ticketCount;

        if (workshop.isFree) {
            const bookingData: any = {
                workshopId: new Types.ObjectId(workshopId),
                foodieId: new Types.ObjectId(foodieId),
                status: BookingStatus.CONFIRMED,
                bookingType: BookingType.FREE,
                ticketCount: ticketCount,
                amount: 0,
                bookedAt: new Date(),
                cancelledAt: null,
                cancellationReason: null,
                refundId: null
            };

            let booking;
            if (existingBooking) {

                booking = await this.bookingRepository.updateStatus(
                    existingBooking._id as string,
                    BookingStatus.CONFIRMED,
                    {
                        ...bookingData,
                        paymentIntentId: null,
                        stripeEventId: null
                    } as any
                );
            } else {
                booking = await this.bookingRepository.create(bookingData as any);
            }

            if (booking) {
                await this.workshopRepository.incrementParticipants(workshopId, ticketCount);
            }

            return { booking: booking! };
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
                    cancelledAt: null,
                    cancellationReason: null,
                    refundId: null,
                    stripeEventId: null,
                    paymentIntentId: paymentIntent.id
                } as any
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
            booking,
            clientSecret: clientSecret || undefined
        };
    }

    async handleStripeWebhook(payload: any, signature: string): Promise<void> {
        console.log('in handle strpewebhook');

        const event = this.stripeService.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        if (event.type === 'payment_intent.succeeded') {
            console.log('in handle strpewebhook succes case');
            const paymentIntent = event.data.object as any;
            const booking = await this.bookingRepository.findByPaymentIntentId(paymentIntent.id);
            if (!booking) return;
            if (booking && booking.status === BookingStatus.PENDING) {
                await this.bookingRepository.updateStatus(booking._id as any, BookingStatus.CONFIRMED, {
                    stripeEventId: event.id
                });
                const workshopId = (booking.workshopId as any)._id ? (booking.workshopId as any)._id : booking.workshopId;
                console.log('workshopid', workshopId);

                await this.workshopRepository.incrementParticipants(workshopId.toString(), booking.ticketCount || 1);
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
            const paymentIntent = event.data.object as any;
            const booking = await this.bookingRepository.findByPaymentIntentId(paymentIntent.id);

            if (booking && booking.status === BookingStatus.PENDING) {
                await this.bookingRepository.updateStatus(booking._id as any, BookingStatus.CANCELLED);
            }
        }
        else if (event.type === 'charge.refunded') {
            console.log('handling charge.refunded event');
            const refund = event.data.object as any;
            const paymentIntentId = refund.payment_intent;

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

    async getMyBookings(foodieId: string): Promise<IBookingDocument[]> {
        return await this.bookingRepository.findByFoodieId(foodieId);
    }

    async getWorkshopParticipants(workshopId: string, chefId: string): Promise<IBookingDocument[]> {
        const workshop = await this.workshopRepository.findById(workshopId);
        if (!workshop) throw new AppError('Workshop not found', 404);

        if (workshop.chefId.toString() !== chefId) {
            throw new AppError('Access denied: You are not the host of this workshop', 403);
        }

        return await this.bookingRepository.findByWorkshopId(workshopId);
    }

    async cancelBooking(bookingId: string, foodieId: string): Promise<void> {
        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) throw new AppError('Booking not found', 404);

        if (booking.foodieId.toString() !== foodieId) {
            throw new AppError('Access denied', 403);
        }

        if (booking.status !== BookingStatus.CONFIRMED) {
            throw new AppError('Only confirmed bookings can be cancelled', 400);
        }

        const workshop = await this.workshopRepository.findById(booking.workshopId);
        if (!workshop) throw new AppError('Workshop not found', 404);

        if (workshop.status === WorkshopStatus.LIVE || workshop.status === WorkshopStatus.COMPLETED) {
            throw new AppError('Cannot cancel booking for a live or completed workshop', 400);
        }

        if (booking.bookingType === BookingType.FREE) {
            await this.bookingRepository.updateStatus(bookingId, BookingStatus.CANCELLED_BY_FOODIE, {
                cancelledAt: new Date(),
                cancellationReason: 'Cancelled by Foodie'
            });
            await this.workshopRepository.decrementParticipants(workshop._id as string, booking.ticketCount || 1);
        } else {
            if (!booking.paymentIntentId) {
                throw new AppError('Payment information missing for paid booking', 500);
            }

            try {
                await this.stripeService.createRefund(booking.paymentIntentId);

                await this.bookingRepository.updateStatus(bookingId, BookingStatus.CANCELLED_BY_FOODIE, {
                    cancelledAt: new Date(),
                    cancellationReason: 'Cancelled by Foodie'
                });

                await this.workshopRepository.decrementParticipants(workshop._id as string, booking.ticketCount || 1);

            } catch (error: any) {
                throw new AppError(`Refund failed: ${error.message}`, 500);
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

    async markAttendance(bookingId: string, status: string): Promise<IBookingDocument> {
        const booking = await this.bookingRepository.findById(bookingId);
        if (!booking) throw new AppError('Booking not found', 404);

        if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.COMPLETED) {
        }

        const updatedBooking = await this.bookingRepository.updateAttendance(bookingId, status);
        if (!updatedBooking) throw new AppError('Failed to update attendance', 500);
        return updatedBooking;
    }
}
