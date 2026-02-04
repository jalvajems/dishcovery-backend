import { injectable, inject } from 'inversify';
import TYPES from '../../DI/types';
import { IBookingService } from '../interface/IBookingService';
import { IBookingRepository } from '../../repostories/interface/IBookingRepository';
import { IWorkshopRepository } from '../../repostories/interface/IWorkshopRepository';
import { IStripeService } from '../interface/IStripeService';
import { IBookingDocument, BookingStatus, BookingType } from '../../types/booking.types';
import { WorkshopStatus } from '../../types/workshop.types';
import { AppError } from '../../utils/AppError';
import { Types } from 'mongoose';
import { ITransactionRepository } from '../../repostories/interface/ITransactionRepository';
import { WalletTransactionStatus, WalletTransactionType } from '../../models/transaction.model';

@injectable()
export class BookingService implements IBookingService {
    constructor(
        @inject(TYPES.IBookingRepository) private bookingRepository: IBookingRepository,
        @inject(TYPES.IWorkshopRepository) private workshopRepository: IWorkshopRepository,
        @inject(TYPES.IStripeService) private stripeService: IStripeService,
        @inject(TYPES.ITransactionRepository) private _transactionRepository: ITransactionRepository,
    ) { }

    async createBooking(workshopId: string, foodieId: string): Promise<{ booking: IBookingDocument; clientSecret?: string }> {
        const workshop = await this.workshopRepository.findById(workshopId);

        if (!workshop) {
            throw new AppError('Workshop not found', 404);
        }

        const allowedStatuses = [WorkshopStatus.APPROVED, WorkshopStatus.UPCOMING];
        if (!allowedStatuses.includes(workshop.status)) {
            throw new AppError(`Workshop is not bookable. Current status: ${workshop.status}`, 409);
        }

        if (workshop.participantsCount >= workshop.participantLimit) {
            throw new AppError('Workshop is full', 400);
        }

        const existingBooking = await this.bookingRepository.findByWorkshopAndFoodie(workshopId, foodieId);

        // Define statuses that allow re-booking
        const retryableStatuses = [
            BookingStatus.CANCELLED,
            BookingStatus.REFUNDED,
            BookingStatus.CANCELLED_BY_FOODIE,
            BookingStatus.CANCELLED_BY_CHEF,
            BookingStatus.PENDING // Allow retrying pending (unpaid) bookings
        ];

        // Check if there is an active booking that cannot be overwritten
        if (existingBooking && !retryableStatuses.includes(existingBooking.status)) {
            throw new AppError('You have already booked this workshop', 409);
        }

        if (workshop.isFree) {
            const bookingData: any = {
                workshopId: new Types.ObjectId(workshopId),
                foodieId: new Types.ObjectId(foodieId),
                status: BookingStatus.CONFIRMED,
                bookingType: BookingType.FREE,
                amount: 0,
                bookedAt: new Date(),
                // Clear cancellation/refund fields if reactivating
                cancelledAt: null,
                cancellationReason: null,
                refundId: null
            };

            let booking;
            if (existingBooking) {
                // Reactivate existing booking
                // Pass null to unset these fields
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
                // Create new booking
                // Do NOT include paymentIntentId/stripeEventId to avoid duplicate null key error
                booking = await this.bookingRepository.create(bookingData as any);
            }

            if (booking) {
                await this.workshopRepository.incrementParticipants(workshopId);
            }

            return { booking: booking! };
        }

        // Paid Workshop
        let booking: IBookingDocument;
        let clientSecret: string;

        if (existingBooking) {
            // Reuse existing booking ID for metadata
            const paymentIntent = await this.stripeService.createPaymentIntent(workshop.price, {
                workshopId,
                bookingId: (existingBooking._id as string).toString(),
                foodieId
            });

            const updatedBooking = await this.bookingRepository.updateStatus(
                existingBooking._id as string,
                BookingStatus.PENDING,
                {
                    status: BookingStatus.PENDING,
                    bookingType: BookingType.PAID, // Ensure type is correct if it was somehow Free before (unlikely but safe)
                    amount: workshop.price,
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
            // Create new booking
            const bookingData = {
                workshopId: new Types.ObjectId(workshopId),
                foodieId: new Types.ObjectId(foodieId),
                status: BookingStatus.PENDING,
                bookingType: BookingType.PAID,
                amount: workshop.price,
                bookedAt: new Date()
            };

            booking = await this.bookingRepository.create(bookingData);

            const paymentIntent = await this.stripeService.createPaymentIntent(workshop.price, {
                workshopId,
                bookingId: (booking._id as string).toString(),
                foodieId
            });

            await this.bookingRepository.updateStatus(booking._id as string, BookingStatus.PENDING, {
                paymentIntentId: paymentIntent.id
            });

            // Re-fetch booking or manually update the local object if needed, but returning 'booking' is mostly for reference.
            // But we updated it properly in DB.
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
                // Assuming workshopId is populated. If not, we might need to fetch it or check type.
                // However, incrementParticipants expects an ID string.
                const workshopId = (booking.workshopId as any)._id ? (booking.workshopId as any)._id : booking.workshopId;
                console.log('workshopid', workshopId);

                await this.workshopRepository.incrementParticipants(workshopId.toString());
            }
            console.log('creating transaction');

            await this._transactionRepository.create({
                userId: booking.foodieId,
                role: 'user',
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
                role: 'chef',
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

            // Verify if it's already marked as REFUNDED to avoid duplicates
            if (booking.status === BookingStatus.REFUNDED) return;

            await this.bookingRepository.updateStatus(booking._id as string, BookingStatus.REFUNDED, {
                refundId: refund.id
            });

            // Credit Foodie (Refund)
            await this._transactionRepository.create({
                userId: booking.foodieId,
                role: 'user',
                bookingId: booking._id as string,
                workshopId: booking.workshopId,
                amount: refund.amount / 100, // Stripe amount is in cents
                type: WalletTransactionType.REFUND,
                status: WalletTransactionStatus.SUCCESS,
                stripePaymentIntentId: paymentIntentId,
                stripeEventId: event.id,
                description: 'Refund for workshop booking'
            });

            // Debit Chef (Reversal)
            const workshop = await this.workshopRepository.findById(booking.workshopId);
            if (workshop) {
                await this._transactionRepository.create({
                    userId: workshop.chefId,
                    role: 'chef',
                    bookingId: booking._id as string,
                    workshopId: booking.workshopId,
                    amount: refund.amount / 100,
                    type: WalletTransactionType.REFUND, // Or create a DEBIT type if preferred, but REFUND implies direction
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

        // Logic split based on Paid vs Free
        if (booking.bookingType === BookingType.FREE) {
            await this.bookingRepository.updateStatus(bookingId, BookingStatus.CANCELLED_BY_FOODIE, {
                cancelledAt: new Date(),
                cancellationReason: 'Cancelled by Foodie'
            });
            await this.workshopRepository.decrementParticipants(workshop._id as string);
        } else {
            // PAID WORKSHOP
            if (!booking.paymentIntentId) {
                throw new AppError('Payment information missing for paid booking', 500);
            }

            try {
                // Initiate refund via Stripe
                await this.stripeService.createRefund(booking.paymentIntentId);

                // Mark as CANCELLED_BY_FOODIE first. 
                // The REFUNDED status and Wallet updates happen in the Webhook (charge.refunded)
                await this.bookingRepository.updateStatus(bookingId, BookingStatus.CANCELLED_BY_FOODIE, {
                    cancelledAt: new Date(),
                    cancellationReason: 'Cancelled by Foodie'
                });

                await this.workshopRepository.decrementParticipants(workshop._id as string);

            } catch (error: any) {
                throw new AppError(`Refund failed: ${error.message}`, 500);
            }
        }
    }

    async processWorkshopCancellation(workshopId: string): Promise<void> {
        const bookings = await this.bookingRepository.findByWorkshopId(workshopId);

        for (const booking of bookings) {
            // Skip if already cancelled or refunded
            if (booking.status === BookingStatus.CANCELLED ||
                booking.status === BookingStatus.CANCELLED_BY_FOODIE ||
                booking.status === BookingStatus.CANCELLED_BY_CHEF ||
                booking.status === BookingStatus.REFUNDED) {
                continue;
            }

            if (booking.bookingType === BookingType.FREE) {
                await this.bookingRepository.updateStatus(booking._id as string, BookingStatus.CANCELLED_BY_CHEF, {
                    cancelledAt: new Date(),
                    cancellationReason: 'Workshop cancelled by Chef'
                });
            } else {
                // PAID
                if (booking.paymentIntentId) {
                    try {
                        await this.stripeService.createRefund(booking.paymentIntentId);

                        // Mark as REFUND_PENDING or CANCELLED_BY_CHEF. 
                        // The refund webhook will confirm it and transaction will be created then.
                        await this.bookingRepository.updateStatus(booking._id as string, BookingStatus.CANCELLED_BY_CHEF, {
                            cancelledAt: new Date(),
                            cancellationReason: 'Workshop cancelled by Chef'
                        });
                    } catch (error) {
                        console.error(`Failed to refund booking ${booking._id}:`, error);
                        // Still mark as CANCELLED_BY_CHEF but maybe flag for admin review if needed
                        // For now, we update status so user sees it's cancelled
                        await this.bookingRepository.updateStatus(booking._id as string, BookingStatus.CANCELLED_BY_CHEF, {
                            cancelledAt: new Date(),
                            cancellationReason: 'Workshop cancelled by Chef (Refund Failed - Contact Support)'
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
            // Depending on logic, maybe only confirmed bookings can be marked present?
            // But let's allow it if it's confirmed.
        }

        const updatedBooking = await this.bookingRepository.updateAttendance(bookingId, status);
        if (!updatedBooking) throw new AppError('Failed to update attendance', 500);
        return updatedBooking;
    }
}
