import { IFoodieDto } from "../../dtos/foodie.dtos";
import { IRecipeDto } from "../../dtos/recipe.dtos";
import { IFoodie } from "../../types/foodie.types";

export interface IFoodieService{
    editFoodieProfile(userId:string,foodieData:IFoodieDto):Promise<{message:string,foodieData:IFoodieDto|IFoodie|null}>;
    getAllRecipes():Promise<{data:IRecipeDto[],message:string}>;
    getRecipeDetail(id:string):Promise<{data:IRecipeDto,message:string}>;
}