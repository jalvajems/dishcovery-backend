import { IUserDocument, UserModel } from "../../models/users.model";
import { ISaveRepository } from "../interface/ISaveRepository";
import { BaseRepository } from "./base.repository";

export class SaveRepository extends BaseRepository<IUserDocument> implements ISaveRepository{
    constructor(){
        super(UserModel)
    }
    async saveRecipe(id: string, recipeId: string): Promise<void> {
        await UserModel.updateOne({_id:id},{$addToSet:{savedRecipes:recipeId}})
    }
    async unSaveRecipe(id: string, recipeId: string): Promise<void> {
        await UserModel.updateOne({_id:id},{$pull:{savedRecipes:recipeId}})
    }
    async getSavedRecipes(id: string): Promise<object|null> {
        const result=await UserModel.findById(id).populate("savedRecipes")
        console.log('result in repo recip',result);
        
        return result;
    }
}