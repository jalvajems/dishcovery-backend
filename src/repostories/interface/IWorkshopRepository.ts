import { IBaseRepository } from './IBaseRepository';
import { IWorkshopDocument } from '../../types/workshop.types';

export interface IWorkshopRepository extends IBaseRepository<IWorkshopDocument> {
    findWithChef(id: string): Promise<IWorkshopDocument | null>;
    incrementParticipants(id: string): Promise<void>;
    decrementParticipants(id: string): Promise<void>;
    findAllByChefId(chefId: string, skip: number, limit: number, search: string, status?: string): Promise<{ datas: IWorkshopDocument[]; totalCount: number }>;
    findAllApprovedWithFilters(skip: number, limit: number, search: string, filter?: string): Promise<{ datas: IWorkshopDocument[]; totalCount: number }>;
}
