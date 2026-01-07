import { IBookingDocument } from "../../models/booking.model";

export interface IBookingService {
    bookWorkshop(workshopId:string,foodieId:string):Promise<{bookingId:string,paymentIntentId?:string}>;
    confirmPayment(paymentIntentId: string) :Promise<void>;
    refundBooking(paymentIntentId: string) :Promise<void>;
}