import { IFoodieDto } from "../../dtos/foodie.dtos";
import { IRecipeDto } from "../../dtos/recipe.dtos";
import { IFoodie } from "../../types/foodie.types";

export interface IFoodieService{
    getAllRecipes():Promise<{data:IRecipeDto[],message:string}>;
    getRecipeDetail(id:string):Promise<{data:IRecipeDto,message:string}>;
    createProfile(userId:string,data:object):Promise<{data:IFoodieDto}>
    updateProfile(userId:string,data:object):Promise<{data:IFoodieDto}>
    getProfile(userId:string):Promise<{data:IFoodieDto}>
}