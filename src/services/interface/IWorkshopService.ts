import { IWorkshopSessionResponseDTO } from '../../dtos/session.dtos';
import { ICreateWorkshopDto, IUpdateWorkshopDto, IWorkshopResponseDTO } from '../../dtos/workshop.dtos';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IWorkshopDocument } from '../../types/workshop.types';

export interface IWorkshopService {
    createWorkshop(chefId: string, data: ICreateWorkshopDto): Promise<IWorkshopResponseDTO>;
    updateWorkshop(workshopId: string, chefId: string, data: IUpdateWorkshopDto): Promise<IWorkshopResponseDTO>;
    getWorkshopById(id: string, userId?: string): Promise<IWorkshopResponseDTO | null>;
    getChefWorkshops(chefId: string): Promise<IWorkshopResponseDTO[]>;
    getAllWorkshopsForAdmin(): Promise<IWorkshopResponseDTO[]>;
    getApprovedWorkshops(page: number, limit: number, search: string, filter?: string, userId?: string): Promise<{ datas: IWorkshopResponseDTO[], totalCount: number }>;
    approveWorkshop(workshopId: string, adminId: string): Promise<IWorkshopResponseDTO>;
    rejectWorkshop(workshopId: string, adminId: string, reason: string): Promise<IWorkshopResponseDTO>;
    startSession(workshopId: string, chefId: string): Promise<{ workshop: IWorkshopResponseDTO, session: IWorkshopSessionResponseDTO }>;
    endSession(workshopId: string, chefId: string): Promise<IWorkshopResponseDTO>;
    submitForApproval(workshopId: string, chefId: string): Promise<IWorkshopResponseDTO>;
    getWorkshopsByChef(chefId: string, page: number, limit: number, search: string, status?: string): Promise<{ datas: IWorkshopResponseDTO[], totalCount: number }>;
    cancelWorkshop(workshopId: string, chefId: string, reason: string): Promise<IWorkshopResponseDTO>;
    getRecentWorkshops(limit: number): Promise<{ data: IWorkshopResponseDTO[] }>;
}
