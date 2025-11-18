import  { FoodieModel, IFoodieDocument } from "../../models/foodie.model";
import { IFoodie } from "../../types/foodie.types";
import { IFoodieRepository } from "../interface/IFoodieRepository";
import { BaseRepository } from "./base.repository";

export class FoodieRepository extends BaseRepository<IFoodieDocument> implements IFoodieRepository{
    constructor(){
        super(FoodieModel);
    }
    async findByEmail(email: string): Promise<IFoodieDocument | null> {
        return FoodieModel.findOne({email});
    }
    async findByUserId(userId: string): Promise<IFoodieDocument | null> {
        return FoodieModel.findById({userId});
    }
    async findOneUpdateFoodie(userId: string, updateData: IFoodie): Promise<IFoodie|null> {
        return await FoodieModel.findOneAndUpdate({userId},updateData,{new:true});
        
    }
}