import { IWalletTransactionDto } from "../../dtos/walletTransaction.dtos";
import { ITransactionDocument } from "../../models/transaction.model";

export function walletTransactionMapper(
  transaction: ITransactionDocument
): IWalletTransactionDto {

  const obj = transaction.toObject();

  return {
    _id: obj._id.toString(),

    userId: obj.userId
      ? typeof obj.userId === "object" && "_id" in obj.userId
        ? {
          id: obj.userId._id,
          name: obj.userId.name
        }
        : obj.userId
      : null,

    role: obj.role,

    bookingId: obj.bookingId
      ? typeof obj.bookingId === "object" && "_id" in obj.bookingId
        ? {
          id: obj.bookingId._id,
          foodieId: (obj.bookingId as any).foodieId
        }
        : obj.bookingId.toString()
      : null,

    workshopId: obj.workshopId
      ? typeof obj.workshopId === "object" && "_id" in obj.workshopId
        ? {
          id: obj.workshopId._id,
          title: (obj.workshopId as any).title,
          chefId: (obj.workshopId as any).chefId
        }
        : obj.workshopId
      : null,

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
