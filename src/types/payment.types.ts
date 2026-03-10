import { Types } from "mongoose";

export interface IPayment{
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  currency: string;
  provider: "stripe";
  providerIntentId: string;
  status: "pending" | "paid" | "failed" | "refunded";

}