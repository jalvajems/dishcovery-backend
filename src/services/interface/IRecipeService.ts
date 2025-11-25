import { IRecipeDto } from "../../dtos/recipe.dtos";
import { IRecipe } from "../../types/recipe.types";

export interface IRecipeService{
    createRecipe(recipeData:IRecipe):Promise<{message:string}>;
    editRecipe(id:string,newDate:IRecipe):Promise<{data:IRecipeDto, message:string}>;
    getAllRecipes(chefId:string,page:number,limit:number):Promise<{data:IRecipeDto[],currentPage:number; totalPages:number;message:string}>;
    getRecipeDetail(id:string):Promise<{data:IRecipeDto,message:string}>
    deleteRecipe(id:string):Promise<{message:string}>
}