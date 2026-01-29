import { IBookingDocument } from '../../types/booking.types';

export interface IBookingService {
    createBooking(workshopId: string, foodieId: string): Promise<{ booking: IBookingDocument; clientSecret?: string }>;
    handleStripeWebhook(payload: any, signature: string): Promise<void>;
    getMyBookings(foodieId: string): Promise<IBookingDocument[]>;
    getWorkshopParticipants(workshopId: string, chefId: string): Promise<IBookingDocument[]>;
    cancelBooking(bookingId: string, foodieId: string): Promise<void>;
    processWorkshopCancellation(workshopId: string): Promise<void>;
}
