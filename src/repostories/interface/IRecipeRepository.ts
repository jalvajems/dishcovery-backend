import { IRecipeDocument } from "../../models/recipe.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IRecipeRepository extends IBaseRepository<IRecipeDocument>{
    findRecipesById(id:string,skip:number,limit:number):Promise<IRecipeDocument[]>;
    
}   