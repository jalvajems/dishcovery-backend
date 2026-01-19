import { Schema, model } from 'mongoose';
import { IWorkshopDocument, WorkshopStatus, WorkshopMode } from '../types/workshop.types';

const workshopSchema = new Schema<IWorkshopDocument>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 5
        },
        description: {
            type: String,
            required: true,
            minlength: 20
        },
        category: {
            type: String,
            required: true
        },
        tags: [{
            type: String
        }],
        chefId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        // Schedule
        date: {
            type: Date,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true,
            min: 1
        },
        participantLimit: {
            type: Number,
            required: true,
            min: 1
        },

        // Mode & Pricing
        mode: {
            type: String,
            enum: Object.values(WorkshopMode),
            required: true
        },
        isFree: {
            type: Boolean,
            required: true,
            default: true
        },
        price: {
            type: Number,
            required: true,
            default: 0
        },

        // Offline Specific
        location: {
            venueName: { type: String },
            address: { type: String },
            city: { type: String },
            latitude: { type: Number },
            longitude: { type: Number },
        },

        // Online Specific
        sessionRoomId: { type: String },
        hostId: { type: Schema.Types.ObjectId, ref: 'User' },
        isLive: { type: Boolean, default: false },

        // Admin Metadata
        status: {
            type: String,
            enum: Object.values(WorkshopStatus),
            default: WorkshopStatus.DRAFT
        },
        approvedAt: { type: Date },
        approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        rejectionReason: { type: String },
        participantsCount: { type: Number, default: 0 }
    },
    {
        timestamps: true
    }
);

// Indexes for common queries
workshopSchema.index({ status: 1, date: 1 });
workshopSchema.index({ chefId: 1 });

export const WorkshopModel = model<IWorkshopDocument>('Workshop', workshopSchema);
