import { IBookingDto } from "../../dtos/booking.dtos";
import { IBookingDocument } from "../../types/booking.types";

export function bookingMapper(booking: IBookingDocument): IBookingDto {
    const obj = booking.toObject ? booking.toObject() : booking;
    return {
        id: (obj._id || obj.id).toString(),
        workshopId: obj.workshopId.toString(),
        foodieId: obj.foodieId.toString(),
        status: obj.status,
        attendanceStatus: obj.attendanceStatus,
        bookingType: obj.bookingType,
        ticketCount: obj.ticketCount,
        amount: obj.amount,
        paymentIntentId: obj.paymentIntentId,
        bookedAt: obj.bookedAt,
        cancelledAt: obj.cancelledAt,
        cancellationReason: obj.cancellationReason
    };
}

export function allBookingsMapper(bookings: IBookingDocument[]): IBookingDto[] {
    return bookings.map(booking => bookingMapper(booking));
}
