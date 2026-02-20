import { injectable } from 'inversify';
import { BookingModel } from '../../models/booking.model';
import { IBooking, IBookingDocument, BookingStatus } from '../../types/booking.types';
import { IBookingRepository } from '../interface/IBookingRepository';
import { BaseRepository } from './base.repository';
import { Types, UpdateQuery } from 'mongoose';

@injectable()
export class BookingRepository extends BaseRepository<IBookingDocument> implements IBookingRepository {
    constructor() {
        super(BookingModel);
    }


    async findByPaymentIntentId(paymentIntentId: string): Promise<IBookingDocument | null> {
        return await this.model.findOne({ paymentIntentId }).populate('workshopId');
    }

    async findByWorkshopAndFoodie(workshopId: string | Types.ObjectId, foodieId: string | Types.ObjectId): Promise<IBookingDocument | null> {
        return await this.model.findOne({ workshopId, foodieId });
    }

    async updateStatus(id: string | Types.ObjectId, status: string, additionalData?: Partial<IBooking>): Promise<IBookingDocument | null> {
        const update: UpdateQuery<IBookingDocument> = { $set: { status } };

        if (additionalData) {
            const setFields: Record<string, unknown> = {};
            const unsetFields: Record<string, unknown> = {};

            Object.entries(additionalData).forEach(([key, value]) => {
                if (value === null) {
                    unsetFields[key] = "";
                } else {
                    setFields[key] = value;
                }
            });

            if (Object.keys(setFields).length > 0) {
                update.$set = { ...update.$set, ...setFields };
            }
            if (Object.keys(unsetFields).length > 0) {
                update.$unset = unsetFields;
            }
        }

        return await this.model.findByIdAndUpdate(
            id,
            update,
            { new: true }
        );
    }

    async findByFoodieId(foodieId: string | Types.ObjectId): Promise<IBookingDocument[]> {
        return await this.model.find({ foodieId }).populate('workshopId').sort({ createdAt: -1 });
    }

    async findByWorkshopId(workshopId: string | Types.ObjectId): Promise<IBookingDocument[]> {
        return await this.model.find({ workshopId }).populate('foodieId', 'name email').sort({ createdAt: -1 });
    }

    async countConfirmedBookings(workshopId: string | Types.ObjectId): Promise<number> {
        return await this.model.countDocuments({
            workshopId,
            status: BookingStatus.CONFIRMED
        });
    }

    async updateAttendance(id: string | Types.ObjectId, status: string): Promise<IBookingDocument | null> {
        return await this.model.findByIdAndUpdate(
            id,
            { $set: { attendanceStatus: status } },
            { new: true }
        );
    }
}
