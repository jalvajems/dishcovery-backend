import { Document, Schema, model } from 'mongoose';
import { ITransaction } from '../types/transaction.types';

export enum WalletTransactionType {
  DEBIT = 'DEBIT',     
  CREDIT = 'CREDIT',   
  REFUND = 'REFUND',   
}

export enum WalletTransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface ITransactionDocument extends ITransaction,Document{}
const TransactionSchema = new Schema<ITransactionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    role: {
      type: String,
      enum: ['user', 'chef'],
      required: true
    },

    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },

    workshopId: {
      type: Schema.Types.ObjectId,
      ref: 'Workshop',
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    currency: {
      type: String,
      default: 'INR'
    },

    type: {
      type: String,
      enum: Object.values(WalletTransactionType),
      required: true
    },

    status: {
      type: String,
      enum: Object.values(WalletTransactionStatus),
      default: WalletTransactionStatus.PENDING
    },

    stripePaymentIntentId: String,
    stripeEventId: String,

    description: String
  },
  { timestamps: true }
);

export const TransactionModel = model(
  'Transaction',
  TransactionSchema
);
