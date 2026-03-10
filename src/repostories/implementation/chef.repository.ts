import { FilterQuery } from "mongoose";
import { ChefModel, IChefDocument } from "../../models/chef.model";
import { IChef } from "../../types/chef.types";
import { IChefRepository } from "../interface/IChefRepository";
import { BaseRepository } from "./base.repository";

export class ChefRepository extends BaseRepository<IChefDocument> implements IChefRepository {
    constructor() {
        super(ChefModel)
    }
    async findByChefId(chefId: string): Promise<IChefDocument | null> {
        return await ChefModel.findOne({ chefId: chefId }).populate("chefId", "name email");
    }
    async updateProfile(chefId: string, data: Partial<IChefDocument>): Promise<IChefDocument | null> {
        return await ChefModel.findOneAndUpdate({ chefId }, data, { new: true })
    }
    async createProfile(data: object): Promise<IChefDocument> {
        console.log('dataprofile', data);

        return await ChefModel.create(data);
    }
    async verifyById(chefId: string): Promise<(IChef & Document) | null> {
        return await ChefModel.findOneAndUpdate({ chefId: chefId }, { $set: { isVerified: true } }, { new: true })
    }
    async unVerifyById(chefId: string): Promise<(IChef & Document) | null> {
        return ChefModel.findByIdAndUpdate({ chefId: chefId }, { $set: { isVerified: false } }, { new: true })
    }

    async findAllChefs(skip: number, limit: number, search: string, filter?: string): Promise<{ datas: IChefDocument[]; totalCount: number }> {
        const query: FilterQuery<IChefDocument> = { isVerified: true, status: 'active' };

        if (search) {
            query.$or = [
                { specialities: { $in: [new RegExp(search, "i")] } }
            ];
        }

        if (filter) {
            if (!query.$and) query.$and = [];
            query.$and.push({ specialities: { $in: [new RegExp(filter, "i")] } });
        }

        const chefs = await ChefModel.find(query)
            .populate("chefId", "name email image")
            .skip(skip)
            .limit(limit);

        const totalCount = await ChefModel.countDocuments(query);
        return { datas: chefs, totalCount };
    }

    async findDetailsByChefId(chefId: string): Promise<IChefDocument | null> {
        return await ChefModel.findOne({ chefId }).populate("chefId", "name email image");
    }
}
