import { ISessionLog, ISessionParticipant, IWorkshopSessionDocument } from '../../types/workshopSession.types';
import { IBaseRepository } from './IBaseRepository';
import { Types } from 'mongoose';

export interface IWorkshopSessionRepository extends IBaseRepository<IWorkshopSessionDocument> {
    findByWorkshopId(workshopId: string | Types.ObjectId): Promise<IWorkshopSessionDocument | null>;
    findByRoomId(roomId: string): Promise<IWorkshopSessionDocument | null>;
    addParticipant(sessionId: string, participantData: ISessionParticipant): Promise<IWorkshopSessionDocument | null>;
    removeParticipant(sessionId: string, foodieId: string): Promise<IWorkshopSessionDocument | null>;
    addLog(sessionId: string, logData: ISessionLog): Promise<IWorkshopSessionDocument | null>;
    endSession(sessionId: string): Promise<IWorkshopSessionDocument | null>;
}
