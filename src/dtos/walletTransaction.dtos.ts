import { Booking, Workshop } from "../types/transaction.types";
import { Role } from "../types/user.types";

export interface IWalletTransactionDto {
  _id: string;

  userId: string | object;
  role: Role;

  bookingId: Booking | string;
  workshopId: Workshop | string;

  amount: number;
  currency: string;

  type: string;
  status: "pending" | "success" | "failed";

  stripePaymentIntentId?: string;
  stripeEventId?: string;

  description?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
