import { IBooking, IBookingDocument } from '../../types/booking.types';
import { Types } from 'mongoose';

export interface IBookingRepository {
    create(data: Partial<IBooking>): Promise<IBookingDocument>;
    findById(id: string | Types.ObjectId): Promise<IBookingDocument | null>;
    findByPaymentIntentId(paymentIntentId: string): Promise<IBookingDocument | null>;
    findByWorkshopAndFoodie(workshopId: string | Types.ObjectId, foodieId: string | Types.ObjectId): Promise<IBookingDocument | null>;
    updateStatus(id: string | Types.ObjectId, status: string, additionalData?: Partial<IBooking>): Promise<IBookingDocument | null>;
    findByFoodieId(foodieId: string | Types.ObjectId): Promise<IBookingDocument[]>;
    findByWorkshopId(workshopId: string | Types.ObjectId): Promise<IBookingDocument[]>;
    countConfirmedBookings(workshopId: string | Types.ObjectId): Promise<number>;
    updateAttendance(id: string | Types.ObjectId, status: string): Promise<IBookingDocument | null>;
}
