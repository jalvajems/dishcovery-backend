import { Types } from "mongoose";
import { WalletTransactionStatus, WalletTransactionType } from "../models/transaction.model";

import { Role } from "./user.types";

export interface ITransaction {
  userId: string | Types.ObjectId;

  role: Role;

  bookingId: string | Types.ObjectId;

  workshopId: string | Types.ObjectId;

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

