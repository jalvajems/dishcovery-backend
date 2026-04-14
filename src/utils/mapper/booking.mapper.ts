import { IBookingDto } from "../../dtos/booking.dtos";
import { IBookingDocument } from "../../types/booking.types";
import { IWorkshopResponseDTO } from "../../dtos/workshop.dtos";
import { IUserDto } from "../../dtos/user.dtos";

export function bookingMapper(booking: IBookingDocument): IBookingDto {
    const obj = booking.toObject ? booking.toObject() : booking;

    const parseReference = <T>(ref: unknown): string | Partial<T> => {
        if (!ref) return '';
        if (typeof ref === 'object' && ref !== null && !(ref instanceof String)) {
            if ('_id' in ref) return ref as Partial<T>;
            const strRef = String(ref);
            if (strRef !== '[object Object]') return strRef;
        }
        return String(ref);
    };

    return {
        id: (obj._id || obj.id)?.toString() || '',
        workshopId: parseReference<IWorkshopResponseDTO>(obj.workshopId),
        foodieId: parseReference<IUserDto>(obj.foodieId),
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
