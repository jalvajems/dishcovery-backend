import { IWorkshopDocument, WorkshopStatus } from '../../types/workshop.types';

export interface IWorkshopService {
    createWorkshop(chefId: string, data: any): Promise<IWorkshopDocument>;
    updateWorkshop(workshopId: string, chefId: string, data: any): Promise<IWorkshopDocument>;
    getWorkshopById(id: string): Promise<IWorkshopDocument | null>;
    getChefWorkshops(chefId: string): Promise<IWorkshopDocument[]>;
    getAllWorkshopsForAdmin(): Promise<IWorkshopDocument[]>;
    getApprovedWorkshops(): Promise<IWorkshopDocument[]>;
    approveWorkshop(workshopId: string, adminId: string): Promise<IWorkshopDocument>;
    rejectWorkshop(workshopId: string, adminId: string, reason: string): Promise<IWorkshopDocument>;
    startSession(workshopId: string, chefId: string): Promise<IWorkshopDocument>;
    endSession(workshopId: string, chefId: string): Promise<IWorkshopDocument>;
    submitForApproval(workshopId: string, chefId: string): Promise<IWorkshopDocument>;
}
