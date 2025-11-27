import { IRecipeDto } from "../../dtos/recipe.dtos";
import { IRecipe } from "../../types/recipe.types";

export interface IRecipeService{
    createRecipe(recipeData:IRecipe):Promise<{message:string}>;
    editRecipe(id:string,newDate:IRecipe):Promise<{data:IRecipeDto, message:string}>;
    getAllRecipesChef(chefId:string,page:number,limit:number,search:string):Promise<{data:IRecipeDto[],currentPage:number; totalPages:number;message:string}>;
    getRecipeDetail(id:string):Promise<{data:IRecipeDto,message:string}>
    deleteRecipe(id:string):Promise<{message:string}>;
    getRelatedRecipes(cuisine:string):Promise<{datas:IRecipeDto[],message:string}>
    getAllRecipes(page:number,limit:number,search:string):Promise<{datas:IRecipeDto[],currentPage:number,totalPage:number}>
}