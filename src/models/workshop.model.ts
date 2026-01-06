import { Schema, model, Types ,Document} from "mongoose";
import { IWorkshop } from "../types/IWorkshop.types";

export enum WorkshopMode {
  ONLINE = "online",
  OFFLINE = "offline",
}

export enum WorkshopType {
  FREE = "free",
  PAID = "paid",
}

export enum WorkshopStatus {
  PENDING = "pending_approval",
  APPROVED = "approved",
  REJECTED = "rejected",
  SCHEDULED = "scheduled",
  LIVE = "live",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface IWorkshopDocument extends IWorkshop,Document{}

const WorkshopSchema = new Schema<IWorkshopDocument>(
  {
    // 🔗 Ownership
    chefId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 📝 Basic Info
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      index: true,
    },

    // 🕒 Scheduling
    startDateTime: {
      type: Date,
      required: true,
    },

    durationInMinutes: {
      type: Number,
      required: true,
      min: 15,
    },

    // 👥 Capacity
    participantLimit: {
      type: Number,
      required: true,
      min: 1,
    },

    // 🌐 Mode
    mode: {
      type: String,
      enum: Object.values(WorkshopMode),
      required: true,
    },

    // 📍 Offline Details
    location: {
      address: { type: String },
      city: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },

    // 💰 Pricing
    type: {
      type: String,
      enum: Object.values(WorkshopType),
      required: true,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // 🛂 Approval & Lifecycle
    status: {
      type: String,
      enum: Object.values(WorkshopStatus),
      default: WorkshopStatus.PENDING,
      index: true,
    },

   approvedBy: {
  type: Types.ObjectId,
  ref: "Admin",
},


    approvedAt: {
      type: Date,
    },

    rejectionReason: {
      type: String,
    },

    // 🎥 Online Session (WebRTC)
    isSessionActive: {
      type: Boolean,
      default: false,
    },

    sessionStartedAt: {
      type: Date,
    },

    sessionEndedAt: {
      type: Date,
    },

    // 📊 Meta
    totalBookings: {
      type: Number,
      default: 0,
    },

  },
  { timestamps: true }
);

export const WorkshopModel = model("Workshop", WorkshopSchema);
