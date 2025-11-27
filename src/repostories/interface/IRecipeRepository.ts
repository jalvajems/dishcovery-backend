import { Document } from "mongoose";
import { IRecipeDocument } from "../../models/recipe.model";
import { IRecipe } from "../../types/recipe.types";
import { IBaseRepository } from "./IBaseRepository";

export interface IRecipeRepository extends IBaseRepository<IRecipeDocument>{
    findRecipesById(id:string,skip:number,limit:number,search:string):Promise<{datas:IRecipeDocument[],totalCount:number}>;
    findAllByPagination(search:string,skip:number,limit:number):Promise<{datas:IRecipeDocument[],totalCount:number}>
    blockById(id:string):Promise<IRecipe & Document|null>;
    unblockById(id:string):Promise<IRecipe & Document|null>;
    findByIdandPopulate(id:string):Promise<IRecipe & Document |null>;
    findByCuisine(cuisine:string):Promise<IRecipeDocument[]|null>;
    
}   