import { IWorkshopSessionResponseDTO } from '../../dtos/session.dtos';
import { ICreateWorkshopDto, IUpdateWorkshopDto, IWorkshopResponseDTO } from '../../dtos/workshop.dtos';
import { IWorkshopDocument } from '../../types/workshop.types';

export interface IWorkshopService {
    createWorkshop(chefId: string, data: ICreateWorkshopDto): Promise<IWorkshopDocument>;
    updateWorkshop(workshopId: string, chefId: string, data: IUpdateWorkshopDto): Promise<IWorkshopDocument>;
    getWorkshopById(id: string, userId?: string): Promise<IWorkshopDocument | null>;
    getChefWorkshops(chefId: string): Promise<IWorkshopDocument[]>;
    getAllWorkshopsForAdmin(): Promise<IWorkshopDocument[]>;
    getApprovedWorkshops(page: number, limit: number, search: string, filter?: string, userId?: string): Promise<{ datas: IWorkshopDocument[], totalCount: number }>;
    approveWorkshop(workshopId: string, adminId: string): Promise<IWorkshopDocument>;
    rejectWorkshop(workshopId: string, adminId: string, reason: string): Promise<IWorkshopDocument>;
    startSession(workshopId: string, chefId: string): Promise<{ workshop: IWorkshopResponseDTO, session: IWorkshopSessionResponseDTO }>;
    endSession(workshopId: string, chefId: string): Promise<IWorkshopDocument>;
    submitForApproval(workshopId: string, chefId: string): Promise<IWorkshopDocument>;
    getWorkshopsByChef(chefId: string, page: number, limit: number, search: string, status?: string): Promise<{ datas: IWorkshopDocument[], totalCount: number }>;
    cancelWorkshop(workshopId: string, chefId: string, reason: string): Promise<IWorkshopDocument>;
    getRecentWorkshops(limit: number): Promise<{ data: IWorkshopDocument[] }>;
}
