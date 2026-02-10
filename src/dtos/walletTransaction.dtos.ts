import { Role } from "../types/user.types";

export interface IWalletTransactionDto {
  _id: string;

  userId: string | object;
  role: Role;

  bookingId: string | object;
  workshopId: string | object;

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
