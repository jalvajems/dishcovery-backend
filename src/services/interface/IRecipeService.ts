import { IRecipeDto } from "../../dtos/recipe.dtos";
import { IRecipe } from "../../types/recipe.types";

export interface IRecipeService{
    createRecipe(recipeData:IRecipe):Promise<{message:string}>;
    editRecipe(id:string,newDate:IRecipe):Promise<{data:IRecipeDto, message:string}>;
    getAllRecipes(chefId:string):Promise<{data:IRecipeDto[],message:string}>;
    getRecipeDetail(id:string):Promise<{data:IRecipeDto,message:string}>
}