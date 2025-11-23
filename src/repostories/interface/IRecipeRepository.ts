import { IRecipeDocument } from "../../models/recipe.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IRecipeRepository extends IBaseRepository<IRecipeDocument>{
    
}