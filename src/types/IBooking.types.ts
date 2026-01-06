export interface IBooking {
    workshopId:object;
    userId: object;
    bookingStatus:string;

    paymentStatus:string;

    paymentIntentId: string;

    amountPaid: number;
    currency: string;

    cancelledAt: Date;
    refundedAt: Date;

    createdAt:Date;
    attended:boolean;

}