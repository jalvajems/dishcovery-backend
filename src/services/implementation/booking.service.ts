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
        if (existingBooking && existingBooking.status !== BookingStatus.CANCELLED) {
            throw new AppError('You have already booked this workshop', 409);
        }

        if (workshop.isFree) {
            const bookingData = {
                workshopId: new Types.ObjectId(workshopId),
                foodieId: new Types.ObjectId(foodieId),
                status: BookingStatus.CONFIRMED,
                bookingType: BookingType.FREE,
                amount: 0,
                bookedAt: new Date()
            };

            const booking = await this.bookingRepository.create(bookingData);
            await this.workshopRepository.incrementParticipants(workshopId);
            return { booking };
        }

        const bookingData = {
            workshopId: new Types.ObjectId(workshopId),
            foodieId: new Types.ObjectId(foodieId),
            status: BookingStatus.PENDING,
            bookingType: BookingType.PAID,
            amount: workshop.price,
            bookedAt: new Date()
        };

        const booking = await this.bookingRepository.create(bookingData);

        const paymentIntent = await this.stripeService.createPaymentIntent(workshop.price, {
            workshopId,
            bookingId: (booking._id as string).toString(),
            foodieId
        });

        await this.bookingRepository.updateStatus(booking._id as string, BookingStatus.PENDING, {
            paymentIntentId: paymentIntent.id
        });

        return {
            booking,
            clientSecret: paymentIntent.client_secret || undefined
        };
    }

    async handleStripeWebhook(payload: any, signature: string): Promise<void> {
        console.log('in handle stripbook');
        
        const event = this.stripeService.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
        
        if (event.type === 'payment_intent.succeeded') {
            console.log('in handle stripbook succes case');
            const paymentIntent = event.data.object as any;
            const booking = await this.bookingRepository.findByPaymentIntentId(paymentIntent.id);
            if (!booking) return;
            if (booking && booking.status === BookingStatus.PENDING) {
                await this.bookingRepository.updateStatus(booking._id as any, BookingStatus.CONFIRMED, {
                    stripeEventId: event.id
                });
                console.log('workshopid',booking.workshopId?._id);
                
                await this.workshopRepository.incrementParticipants(booking.workshopId?._id.toString());
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

        if (workshop.status === WorkshopStatus.LIVE) {
            throw new AppError('Cannot cancel booking for a live workshop', 400);
        }

        await this.bookingRepository.updateStatus(bookingId as string, BookingStatus.CANCELLED, {
            cancelledAt: new Date()
        });
        await this.workshopRepository.decrementParticipants(workshop._id as string);
    }
}
