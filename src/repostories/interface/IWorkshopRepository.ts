import { IBaseRepository } from './IBaseRepository';
import { IWorkshopDocument } from '../../types/workshop.types';

export interface IWorkshopRepository extends IBaseRepository<IWorkshopDocument> {
    // Add any workshop-specific repository methods here
    findWithChef(id: string): Promise<IWorkshopDocument | null>;
    incrementParticipants(id: string): Promise<void>;
    decrementParticipants(id: string): Promise<void>;
}
