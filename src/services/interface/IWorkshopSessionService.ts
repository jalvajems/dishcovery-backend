import { IWorkshopSessionDocument } from '../../types/workshopSession.types';

export interface IWorkshopSessionService {
    startSession(workshopId: string, chefId: string): Promise<IWorkshopSessionDocument>;
    endSession(workshopId: string, chefId: string): Promise<void>;
    joinSession(workshopId: string, foodieId: string): Promise<{ session: IWorkshopSessionDocument, role: string }>;
    leaveSession(workshopId: string, foodieId: string): Promise<void>;
    getSessionInfo(workshopId: string): Promise<IWorkshopSessionDocument | null>;
    getActiveSessions(): Promise<IWorkshopSessionDocument[]>;
}
