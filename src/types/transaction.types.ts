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

export interface FoodieUser {
  _id: string
  name: string
  email: string
}

export interface Booking {
  _id: string
  foodieId: FoodieUser | string
}

export interface ChefUser {
  _id: string
  name: string
}

export interface Workshop {
  _id: string
  title: string
  chefId: ChefUser | string
}