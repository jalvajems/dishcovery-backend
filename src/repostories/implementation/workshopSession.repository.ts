import { injectable } from 'inversify';
import { WorkshopSessionModel } from '../../models/workshopSession.model';
import { IWorkshopSessionDocument } from '../../types/workshopSession.types';
import { IWorkshopSessionRepository } from '../interface/IWorkshopSessionRepository';
import { BaseRepository } from './base.repository';
import  { Types } from 'mongoose';

@injectable()
export class WorkshopSessionRepository extends BaseRepository<IWorkshopSessionDocument> implements IWorkshopSessionRepository {
    constructor() {
        super(WorkshopSessionModel);
    }

    async findByWorkshopId(workshopId: string | Types.ObjectId): Promise<IWorkshopSessionDocument | null> {
        const res= await WorkshopSessionModel.findOne({ workshopId:workshopId }).populate('participants.foodieId', 'name email');
        
        return res
    }

    async findByRoomId(roomId: string): Promise<IWorkshopSessionDocument | null> {
        return await this.model.findOne({ roomId, isLive: true });
    }

    async addParticipant(sessionId: string, participantData: any): Promise<IWorkshopSessionDocument | null> {
        return await this.model.findByIdAndUpdate(
            sessionId,
            { $push: { participants: participantData } },
            { new: true }
        );
    }

    async removeParticipant(sessionId: string, foodieId: string): Promise<IWorkshopSessionDocument | null> {
        return await this.model.findByIdAndUpdate(
            sessionId,
            {
                $set: { "participants.$[elem].leftAt": new Date() }
            },
            {
                arrayFilters: [{ "elem.foodieId": foodieId, "elem.leftAt": { $exists: false } }],
                new: true
            }
        );
    }

    async addLog(sessionId: string, logData: any): Promise<IWorkshopSessionDocument | null> {
        return await this.model.findByIdAndUpdate(
            sessionId,
            { $push: { logs: logData } },
            { new: true }
        );
    }

    async endSession(sessionId: string): Promise<IWorkshopSessionDocument | null> {
        return await this.model.findByIdAndUpdate(
            sessionId,
            {
                $set: {
                    isLive: false,
                    endedAt: new Date(),
                    "participants.$[elem].leftAt": new Date()
                }
            },
            {
                arrayFilters: [{ "elem.leftAt": { $exists: false } }],
                new: true
            }
        );
    }
}
