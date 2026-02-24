import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
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

    async incrementParticipants(id: string, count: number): Promise<void> {
        await this.model.findByIdAndUpdate(id, { $inc: { participantsCount: count } });
    }

    async decrementParticipants(id: string, count: number): Promise<void> {
        await this.model.findByIdAndUpdate(id, { $inc: { participantsCount: -count } });
    }

    async findAllForAdmin(): Promise<IWorkshopDocument[]> {
        return await this.model.find({}).sort({ createdAt: -1 });
    }

    async findAllByChefId(chefId: string, skip: number, limit: number, search: string, status?: string): Promise<{ datas: IWorkshopDocument[]; totalCount: number }> {
        const query: FilterQuery<IWorkshopDocument> = { chefId };
        console.log('status---', status);

        if (search || search.length !== 0) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (status && status !== 'All') {
            query.status = status;
        }
        console.log('~~~~~', query);


        const workshops = await this.model.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalCount = await this.model.countDocuments(query);
        return { datas: workshops, totalCount };
    }

    async findAllApprovedWithFilters(skip: number, limit: number, search: string, filter?: string): Promise<{ datas: IWorkshopDocument[]; totalCount: number }> {
        const query: FilterQuery<IWorkshopDocument> = {
            status: { $in: ['APPROVED', 'UPCOMING', 'LIVE'] }
        };

        if (search) {
            query.$or = [
                { title: new RegExp(search, "i") },
                { description: new RegExp(search, "i") }
            ];
        }

        if (filter && filter !== 'all') {
            query.$or = [
                { category: new RegExp(filter, "i") },
                { mode: new RegExp(filter, "i") }
            ];
        }

        const workshops = await this.model.find(query)
            .populate('chefId', 'name image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalCount = await this.model.countDocuments(query);
        return { datas: workshops, totalCount };
    }

    async findRecentApproved(limit: number): Promise<IWorkshopDocument[]> {
        return await this.model.find({
            status: { $in: ['APPROVED', 'UPCOMING'] }
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('chefId', 'name image');
    }
}
