export interface IWalletTransactionDto {
  _id: string;

  userId: string | object;
  role: "user" | "chef";

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
