import { IRecipeDocument, RecipeModel } from "../../models/recipe.model";
import { IRecipeRepository } from "../interface/IRecipeRepository";
import { BaseRepository } from "./base.repository";

export class RecipeRepository extends BaseRepository<IRecipeDocument> implements IRecipeRepository{
    constructor(){
        super(RecipeModel);
    }
    async findRecipesById(id: string, skip: number, limit: number): Promise<IRecipeDocument[]> {
        return RecipeModel.find({chefId:id}).skip(skip).limit(limit);
    }

    
}
