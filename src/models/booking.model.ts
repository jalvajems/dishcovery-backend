import mongoose, { Schema } from 'mongoose';
import { IBookingDocument, BookingStatus, BookingType, AttendanceStatus } from '../types/booking.types';

const BookingSchema: Schema = new Schema(
    {
        workshopId: {
            type: Schema.Types.ObjectId,
            ref: 'Workshop',
            required: true
        },
        foodieId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: Object.values(BookingStatus),
            default: BookingStatus.PENDING
        },
        attendanceStatus: {
            type: String,
            enum: Object.values(AttendanceStatus),
            default: AttendanceStatus.PENDING
        },
        bookingType: {
            type: String,
            enum: Object.values(BookingType),
            required: true
        },
        amount: {
            type: Number,
            required: true,
            default: 0
        },
        paymentIntentId: {
            type: String,
            unique: true,
            sparse: true
        },
        stripeEventId: {
            type: String,
            unique: true,
            sparse: true
        },
        bookedAt: {
            type: Date,
            default: Date.now
        },
        cancelledAt: {
            type: Date
        },
        cancellationReason: {
            type: String
        },
        refundId: {
            type: String
        }
    },
    {
        timestamps: true
    }
);


BookingSchema.index({ workshopId: 1, foodieId: 1 }, { unique: true });

export const BookingModel = mongoose.model<IBookingDocument>('Booking', BookingSchema);
