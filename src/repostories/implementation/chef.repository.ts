import { child } from "winston";
import { ChefModel, IChefDocument } from "../../models/chef.model";
import { IChef } from "../../types/chef.types";
import { IChefRepository } from "../interface/IChefRepository";
import { BaseRepository } from "./base.repository";

export class ChefRepository extends BaseRepository<IChefDocument> implements IChefRepository{
    constructor(){
        super(ChefModel)
    }
    async findByChefId(chefId: string): Promise<IChefDocument|null > {
        return await ChefModel.findOne({chefId:chefId}).populate("chefId","name email");
    }
    async updateProfile(chefId: string, data: Partial<IChefDocument>): Promise<IChefDocument | null> {
        return await ChefModel.findOneAndUpdate({chefId},data,{new:true})
    }
    async createProfile(data: object): Promise<IChefDocument> {
        console.log('dataprofile', data);
        
        return await ChefModel.create(data);
    }
    async verifyById(chefId: string): Promise<(IChef & Document) | null> {
        return  await ChefModel.findOneAndUpdate({chefId:chefId},{$set:{isVerified:true}},{new:true})
    }
    async unVerifyById(chefId: string): Promise<(IChef & Document) | null> {
        return ChefModel.findByIdAndUpdate({chefId:chefId},{$set:{isVerified:false}},{new:true})
    }
    

}
