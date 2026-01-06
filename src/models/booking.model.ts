import { Document, Schema, model } from "mongoose";
import { IBooking } from "../types/IBooking.types";

export interface IBookingDocument extends IBooking,Document{} 


const BookingSchema = new Schema<IBookingDocument>(
  {
    workshopId: {
      type: Schema.Types.ObjectId,
      ref: "Workshop",
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["not_required", "pending", "paid", "refunded"],
      default: "not_required",
    },

    paymentIntentId: String,

    amountPaid: Number,
    currency: String,

    cancelledAt: Date,
    refundedAt: Date,
    attended: {
  type: Boolean,
  default: false,
},



  },
  { timestamps: true }
);
BookingSchema.index(
  { workshopId: 1, userId: 1 },
  { unique: true }
);

export const BookingModel=model("Booking",BookingSchema)
