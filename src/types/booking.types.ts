import { Types, Document } from 'mongoose';

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    REFUND_PENDING = 'REFUND_PENDING',
    REFUNDED = 'REFUNDED'
}

export enum BookingType {
    FREE = 'FREE',
    PAID = 'PAID'
}

export interface IBooking {
    workshopId: string | Types.ObjectId;
    foodieId: string | Types.ObjectId;
    status: BookingStatus;
    bookingType: BookingType;
    amount: number;
    paymentIntentId?: string;
    stripeEventId?: string;
    bookedAt: Date;
    cancelledAt?: Date;
}

export interface IBookingDocument extends IBooking, Document { }
