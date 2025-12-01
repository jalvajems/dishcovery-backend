import  { FoodieModel, IFoodieDocument } from "../../models/foodie.model";
import { IFoodie } from "../../types/foodie.types";
import { IFoodieRepository } from "../interface/IFoodieRepository";
import { BaseRepository } from "./base.repository";

export class FoodieRepository extends BaseRepository<IFoodieDocument> implements IFoodieRepository{
    constructor(){
        super(FoodieModel);
    }
    async getByUserId(userId: string): Promise<IFoodieDocument | null> {
        return FoodieModel.findOne({userId}).populate("userId","name email");
    }
    async findOneUpdateFoodie(userId: string, updateData: object): Promise<IFoodieDocument|null> {
        return await FoodieModel.findOneAndUpdate({userId},updateData,{new:true});
        
    }
}