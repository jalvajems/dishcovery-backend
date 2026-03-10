import { Types, Document } from 'mongoose';

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED_BY_FOODIE = 'CANCELLED_BY_FOODIE',
    CANCELLED_BY_CHEF = 'CANCELLED_BY_CHEF',
    REFUNDED = 'REFUNDED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum BookingType {
    FREE = 'FREE',
    PAID = 'PAID'
}

export enum AttendanceStatus {
    PENDING = 'PENDING',
    PRESENT = 'PRESENT',
    ABSENT = 'ABSENT'
}

export interface IBooking {
    workshopId: string | Types.ObjectId;
    foodieId: string | Types.ObjectId;
    status: BookingStatus;
    attendanceStatus: AttendanceStatus;
    bookingType: BookingType;
    ticketCount: number;
    amount: number;
    paymentIntentId?: string;
    stripeEventId?: string;
    refundId?: string;
    bookedAt: Date;
    cancelledAt?: Date;
    cancellationReason?: string;
}

export interface IBookingDocument extends IBooking, Document { }
