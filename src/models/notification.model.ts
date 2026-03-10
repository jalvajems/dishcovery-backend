import mongoose, { Schema, Document, Types } from "mongoose";
import { Role } from "../types/user.types";

export interface INotification extends Document {
    recipientId: Types.ObjectId;
    recipientRole: Role.CHEF | Role.FOODIE;
    title: string;
    message: string;
    type: 'SESSION_STARTED' | 'SESSION_CANCELLED' | 'WORKSHOP_APPROVED' | 'WORKSHOP_REJECTED' | 'WORKSHOP_EXPIRED';
    workshopId?: Types.ObjectId;
    sessionId?: Types.ObjectId;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
    recipientId: { type: Schema.Types.ObjectId, required: true, refPath: 'recipientRole' },
    recipientRole: { type: String, enum: ['chef', 'foodie'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['SESSION_STARTED', 'SESSION_CANCELLED', 'WORKSHOP_APPROVED', 'WORKSHOP_REJECTED', 'WORKSHOP_EXPIRED'],
        required: true
    },
    workshopId: { type: Schema.Types.ObjectId, ref: 'Workshop' },
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    isRead: { type: Boolean, default: false },
}, {
    timestamps: true
});

NotificationSchema.index({ recipientId: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);
