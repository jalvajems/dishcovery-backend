import { IBookingDocument } from '../../types/booking.types';
import { IStripeWebhookPayload } from '../../dtos/booking.dtos';

export interface IBookingService {
    createBooking(workshopId: string, foodieId: string, ticketCount?: number): Promise<{ booking: IBookingDocument; clientSecret?: string }>;
    handleStripeWebhook(payload: string | Buffer, signature: string): Promise<void>;
    getMyBookings(foodieId: string): Promise<IBookingDocument[]>;
    getWorkshopParticipants(workshopId: string, chefId: string): Promise<IBookingDocument[]>;
    cancelBooking(bookingId: string, foodieId: string): Promise<void>;
    processWorkshopCancellation(workshopId: string, reason?: string): Promise<void>;
    markAttendance(bookingId: string, status: string): Promise<IBookingDocument>;
}
