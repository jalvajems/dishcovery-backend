import { inject, injectable } from "inversify";
import { Types } from 'mongoose'
import { IBookingService } from "../interface/IBookingService";
import TYPES from "../../DI/types";
import { IBookingRepository } from "../../repostories/interface/IBookingRepository";
import { IWorkshopRepository } from "../../repostories/interface/IWorkshopRepository";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { WorkshopStatus } from "../../models/workshop.model";
import { BOOKING_STATUS, PAID, PAYMENT_STATUS } from "../../constants/Booking";
import { IPaymentService } from "../interface/IPaymentService";

@injectable()
export class BookingService implements IBookingService {
    constructor(
        @inject(TYPES.IBookingRepository) private _bookingRepository: IBookingRepository,
        @inject(TYPES.IWorkshopRepository) private _workshopRepository: IWorkshopRepository,
        @inject(TYPES.IPaymentService) private _paymentService: IPaymentService,
    ) { }

    async bookWorkshop(workshopId: string, foodieId: string): Promise<{ bookingId: string, paymentIntentId?: string }> {
        try {
            const workshop = await this._workshopRepository.findById(workshopId);

            if (!workshop) {
                throw new AppError('workshop is not found', STATUS_CODE.NOT_FOUND)
            }
            if (![WorkshopStatus.APPROVED, WorkshopStatus.SCHEDULED].includes(workshop.status)) {
                throw new AppError('workshop not open for booking', STATUS_CODE.BAD_REQUEST)
            }
            if (workshop.startDateTime <= new Date()) {
                throw new AppError('workshop already started', STATUS_CODE.CONFLICT)
            }
            if (workshop.chefId.toString() === foodieId) {
                throw new AppError('chef cannot book own workshop', STATUS_CODE.FORBIDDEN)
            }
            const existing = await this._bookingRepository.findOne({
                workshopId,
                userId: foodieId,
                bookingStatus: { $ne: "cancelled" }
            })
            if (existing) {
                throw new AppError('already booked', STATUS_CODE.CONFLICT)
            }
            const isPaid = workshop.type === 'paid';
            const payload = {

                workshopId: new Types.ObjectId(workshopId),
                userId: new Types.ObjectId(foodieId),


            }
            const booking = await this._bookingRepository.create({
                ...payload,
                bookingStatus: isPaid ? PAID.PENDING : PAID.CONFIRMED,
                paymentStatus: isPaid ? PAID.PENDING : PAID.NOT_REQUIRED,
                amountPaid: isPaid ? workshop.price : 0,
                currency: workshop.currency
            })
            if (!isPaid) {
                const reserved = await this._workshopRepository.reserveSlotIfAvailable(workshopId)
                if (!reserved) {
                    await this._bookingRepository.deleteById(booking.id)
                    throw new AppError('workshop is full', STATUS_CODE.CONFLICT)
                }
            }
            if (isPaid) {
                const paymentIntent = await this._paymentService.createPaymentIntent(
                    booking.id.toString(),
                    foodieId,
                    workshop.price,
                    workshop.currency
                )
                await this._bookingRepository.updateById(booking.id, {
                    paymentIntentId: paymentIntent.intentId,
                    paymentStatus: PAYMENT_STATUS.PENDING,
                });
                return {
                    bookingId: booking.id,
                    paymentIntentId: paymentIntent.intentId
                };

            }
            return {
                bookingId: booking.id
            };

        } catch (error) {
            throw error;
        }
    }
    async confirmPayment(paymentIntentId: string): Promise<void> {
        try {

            const booking = await this._bookingRepository.findOne({ paymentIntentId });

            if (!booking)
                throw new AppError("Booking not found", STATUS_CODE.NOT_FOUND);

            if (booking.paymentStatus === "paid") {
                return;
            }
            const reserved = await this._workshopRepository.reserveSlotIfAvailable(
                booking.workshopId.toString()
            );

            if (!reserved)
                throw new AppError("Workshop full, refund required", 409);

            await this._bookingRepository.updateById(booking.id, {
                bookingStatus: BOOKING_STATUS.CONFIRMED,
                paymentStatus: PAYMENT_STATUS.PAID,
            });

        } catch (error) {
            throw error;
        }
    }

    async refundBooking(paymentIntentId: string): Promise<void> {
        try {
            const booking = await this._bookingRepository.findOne({ paymentIntentId });

            if (!booking)
                throw new AppError("Booking not found", STATUS_CODE.NOT_FOUND);
            if (booking.paymentStatus === PAYMENT_STATUS.REFUNDED) {
                  return;
                }

            await this._paymentService.refundPayment(paymentIntentId);

            await this._bookingRepository.updateById(
                booking.id,
                {
                    bookingStatus: BOOKING_STATUS.CANCELLED,
                    paymentStatus: PAYMENT_STATUS.REFUNDED,
                }
            );

            await this._workshopRepository.decrementBooking(booking.workshopId.toString());

        } catch (error) {
            throw error;
        }
    }

}