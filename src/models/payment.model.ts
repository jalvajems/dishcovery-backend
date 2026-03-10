import { Document, model, Schema } from "mongoose";
import { IPayment } from "../types/payment.types";

export interface IPaymentDocument extends IPayment,Document{}

const PaymentSchema=new Schema<IPaymentDocument>({
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: Number,
    currency: String,
    provider: { type: String, default: "stripe" },
    providerIntentId: String,
    status: { type: String, default: "pending" },

},
  { timestamps: true }
)

export const PaymentModel=model("Payment",PaymentSchema)