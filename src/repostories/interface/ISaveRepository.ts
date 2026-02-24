import { IUserDocument } from "../../models/users.model";
import { IBaseRepository } from "./IBaseRepository";

export interface ISaveRepository extends IBaseRepository<IUserDocument>{
     saveRecipe(id:string,recipeId:string):Promise<void>;
    unSaveRecipe(id:string,recipeId:string):Promise<void>;
    getSavedRecipes(id:string):Promise<object|null>
}