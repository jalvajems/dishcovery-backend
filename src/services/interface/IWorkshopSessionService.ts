// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IWorkshopSessionDocument } from '../../types/workshopSession.types';
import { IWorkshopSessionResponseDTO } from '../../dtos/session.dtos';

export interface IWorkshopSessionService {
    startSession(workshopId: string, chefId: string): Promise<IWorkshopSessionResponseDTO>;
    endSession(workshopId: string, chefId: string): Promise<void>;
    joinSession(workshopId: string, foodieId: string): Promise<{ session: IWorkshopSessionResponseDTO, role: string }>;
    leaveSession(workshopId: string, foodieId: string): Promise<void>;
    getSessionInfo(workshopId: string): Promise<IWorkshopSessionResponseDTO | null>;
    getActiveSessions(): Promise<IWorkshopSessionResponseDTO[]>;
}
