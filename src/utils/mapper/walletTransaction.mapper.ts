import { IWalletTransactionDto } from "../../dtos/walletTransaction.dtos";
import { ITransactionDocument } from "../../models/transaction.model";
import { IUser } from "../../types/user.types";
import { IBooking } from "../../types/booking.types";
import { IWorkshop } from "../../types/workshop.types";
import { Types } from "mongoose";

export function walletTransactionMapper(
  transaction: ITransactionDocument
): IWalletTransactionDto {

  const obj = transaction.toObject();

  return {
    _id: obj._id.toString(),

    userId: obj.userId
      ? typeof obj.userId === "object" && "_id" in obj.userId
        ? {
          _id: (obj.userId as unknown as IUser & { _id: Types.ObjectId })._id.toString(),
          name: (obj.userId as unknown as IUser).name
        }
        : obj.userId.toString()
      : null,

    role: obj.role,

    bookingId: obj.bookingId
      ? typeof obj.bookingId === "object" && "_id" in obj.bookingId
        ? {
          _id: (obj.bookingId as unknown as IBooking & { _id: Types.ObjectId })._id.toString(),
          foodieId: typeof (obj.bookingId as unknown as IBooking).foodieId === "object" && "_id" in ((obj.bookingId as unknown as IBooking).foodieId as any)
            ? {
              _id: ((obj.bookingId as unknown as IBooking).foodieId as any)._id.toString(),
              name: ((obj.bookingId as unknown as IBooking).foodieId as any).name,
              email: ((obj.bookingId as unknown as IBooking).foodieId as any).email
            }
            : (obj.bookingId as unknown as IBooking).foodieId.toString()
        }
        : obj.bookingId.toString()
      : null as any,

    workshopId: obj.workshopId
      ? typeof obj.workshopId === "object" && "_id" in obj.workshopId
        ? {
          _id: (obj.workshopId as unknown as IWorkshop & { _id: Types.ObjectId })._id.toString(),
          title: (obj.workshopId as unknown as IWorkshop).title,
          chefId: typeof (obj.workshopId as unknown as IWorkshop).chefId === "object" && "_id" in ((obj.workshopId as unknown as IWorkshop).chefId as any)
            ? {
              _id: ((obj.workshopId as unknown as IWorkshop).chefId as any)._id.toString(),
              name: ((obj.workshopId as unknown as IWorkshop).chefId as any).name
            }
            : (obj.workshopId as unknown as IWorkshop).chefId.toString()
        }
        : obj.workshopId.toString()
      : null as any,

    amount: obj.amount,
    currency: obj.currency,

    type: obj.type,
    status: obj.status,

    stripePaymentIntentId: obj.stripePaymentIntentId,
    stripeEventId: obj.stripeEventId,

    description: obj.description,

    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
}
