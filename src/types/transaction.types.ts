import { Types } from "mongoose";
import { WalletTransactionStatus, WalletTransactionType } from "../models/transaction.model"; 

export interface ITransaction {
  userId: string | Types.ObjectId;

  role: "user" | "chef";

  bookingId:string |  Types.ObjectId;

  workshopId:string |  Types.ObjectId;

  amount: number;

  currency: string; 

  type: WalletTransactionType;

  status: WalletTransactionStatus;

  stripePaymentIntentId?: string;

  stripeEventId?: string;

  description?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

