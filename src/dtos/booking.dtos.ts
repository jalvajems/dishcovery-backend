export interface IStripeWebhookPayload {
    id: string;
    object: string;
    api_version: string;
    created: number;
    data: {
        object: unknown; // Stripe objects can be complex, keeping as unknown for flexibility
    };
    livemode: boolean;
    pending_webhooks: number;
    request: {
        id: string;
        idempotency_key: string;
    };
    type: string;
}

import { BookingStatus, BookingType, AttendanceStatus } from '../types/booking.types';
import { IWorkshopResponseDTO } from './workshop.dtos';
import { IUserDto } from './user.dtos';

export interface IBookingDto {
    id: string;
    workshopId: string | Partial<IWorkshopResponseDTO>;
    foodieId: string | Partial<IUserDto>;
    status: BookingStatus;
    attendanceStatus: AttendanceStatus;
    bookingType: BookingType;
    ticketCount: number;
    amount: number;
    paymentIntentId?: string;
    bookedAt: Date;
    cancelledAt?: Date;
    cancellationReason?: string;
}
