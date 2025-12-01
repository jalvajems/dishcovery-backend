import { ChefModel, IChefDocument } from "../../models/chef.model";
import { IChefRepository } from "../interface/IChefRepository";
import { BaseRepository } from "./base.repository";

export class ChefRepository extends BaseRepository<IChefDocument> implements IChefRepository{
    constructor(){
        super(ChefModel)
    }
    async findByChefId(chefId: string): Promise<IChefDocument|null > {
        return await ChefModel.findOne({chefId}).populate("chefId","name email");
    }
    async updateProfile(chefId: string, data: Partial<IChefDocument>): Promise<IChefDocument | null> {
        return await ChefModel.findOneAndUpdate({chefId},data,{new:true})
    }
    async createProfile(data: object): Promise<IChefDocument> {
        return await ChefModel.create(data);
    }
}
