import { Schema, model } from 'mongoose';
import { IWorkshopSessionDocument } from '../types/workshopSession.types';

const sessionParticipantSchema = new Schema({
    foodieId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    isMuted: { type: Boolean, default: false }
});

const sessionLogSchema = new Schema({
    type: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed }
});

const workshopSessionSchema = new Schema<IWorkshopSessionDocument>({
    workshopId: { type: Schema.Types.ObjectId, ref: 'Workshop', required: true },
    chefId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roomId: { type: String, required: true, unique: true },
    isLive: { type: Boolean, default: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    participants: [sessionParticipantSchema],
    logs: [sessionLogSchema]
}, {
    timestamps: true
});

export const WorkshopSessionModel = model<IWorkshopSessionDocument>('WorkshopSession', workshopSessionSchema);
