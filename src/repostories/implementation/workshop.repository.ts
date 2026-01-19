import { injectable } from 'inversify';
import { WorkshopModel } from '../../models/workshop.model';
import { IWorkshopDocument } from '../../types/workshop.types';
import { IWorkshopRepository } from '../interface/IWorkshopRepository';
import { BaseRepository } from './base.repository';

@injectable()
export class WorkshopRepository extends BaseRepository<IWorkshopDocument> implements IWorkshopRepository {
    constructor() {
        super(WorkshopModel);
    }

    async findWithChef(id: string): Promise<IWorkshopDocument | null> {
        return await this.model.findById(id).populate('chefId', 'name email');
    }

    async incrementParticipants(id: string): Promise<void> {
        await this.model.findByIdAndUpdate(id, { $inc: { participantsCount: 1 } });
    }

    async decrementParticipants(id: string): Promise<void> {
        await this.model.findByIdAndUpdate(id, { $inc: { participantsCount: -1 } });
    }
}
