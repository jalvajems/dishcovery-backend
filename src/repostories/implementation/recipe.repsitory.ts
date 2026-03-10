import { IRecipeDocument, RecipeModel } from "../../models/recipe.model";
import { IRecipeRepository } from "../interface/IRecipeRepository";
import { BaseRepository } from "./base.repository";

export class RecipeRepository extends BaseRepository<IRecipeDocument> implements IRecipeRepository{
    constructor(){
        super(RecipeModel);
    }
    
}
