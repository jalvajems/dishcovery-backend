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

    userId: (obj.userId
      ? typeof obj.userId === "object" && obj.userId !== null && "_id" in obj.userId
        ? {
          _id: String((obj.userId as unknown as IUser & { _id: Types.ObjectId })._id),
          name: String((obj.userId as unknown as IUser).name)
        }
        : String(obj.userId)
      : undefined) as never,

    role: obj.role,

    bookingId: (obj.bookingId
      ? typeof obj.bookingId === "object" && obj.bookingId !== null && "_id" in obj.bookingId
        ? {
          _id: String((obj.bookingId as unknown as IBooking & { _id: Types.ObjectId })._id),
          foodieId: typeof (obj.bookingId as unknown as IBooking).foodieId === "object" && (obj.bookingId as unknown as IBooking).foodieId !== null && "_id" in ((obj.bookingId as unknown as IBooking).foodieId as unknown as Record<string, unknown>)
            ? {
              _id: String(((obj.bookingId as unknown as IBooking).foodieId as unknown as Record<string, unknown>)._id),
              name: String(((obj.bookingId as unknown as IBooking).foodieId as unknown as Record<string, unknown>).name),
              email: String(((obj.bookingId as unknown as IBooking).foodieId as unknown as Record<string, unknown>).email)
            }
            : String((obj.bookingId as unknown as IBooking).foodieId)
        }
        : String(obj.bookingId)
      : undefined) as never,

    workshopId: (obj.workshopId
      ? typeof obj.workshopId === "object" && obj.workshopId !== null && "_id" in obj.workshopId
        ? {
          _id: String((obj.workshopId as unknown as IWorkshop & { _id: Types.ObjectId })._id),
          title: String((obj.workshopId as unknown as IWorkshop).title),
          chefId: typeof (obj.workshopId as unknown as IWorkshop).chefId === "object" && (obj.workshopId as unknown as IWorkshop).chefId !== null && "_id" in ((obj.workshopId as unknown as IWorkshop).chefId as unknown as Record<string, unknown>)
            ? {
              _id: String(((obj.workshopId as unknown as IWorkshop).chefId as unknown as Record<string, unknown>)._id),
              name: String(((obj.workshopId as unknown as IWorkshop).chefId as unknown as Record<string, unknown>).name)
            }
            : String((obj.workshopId as unknown as IWorkshop).chefId)
        }
        : String(obj.workshopId)
      : undefined) as never,

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
