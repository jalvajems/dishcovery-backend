import { IRecipeDto } from "../../dtos/recipe.dtos";
import { IRecipe } from "../../types/recipe.types";

export interface IRecipeService {
    createRecipe(recipeData: IRecipe): Promise<{ message: string }>;
    editRecipe(recipeId: string, newDate: IRecipe): Promise<{ data: IRecipeDto, message: string }>;
    getAllRecipesChef(chefId: string, page: number, limit: number, search: string): Promise<{ data: IRecipeDto[], currentPage: number; totalPages: number; message: string }>;
    getRecipeDetail(recipeId: string, userId: string): Promise<{ data: IRecipeDto, message: string }>
    deleteRecipe(recipeId: string): Promise<{ message: string }>;
    getRelatedRecipes(cuisine: string): Promise<{ datas: IRecipeDto[], message: string }>
    getAllRecipes(page: number, limit: number, search: string, filter?: Record<string, unknown>): Promise<{ datas: IRecipeDto[], currentPage: number, totalPage: number }>;
    toggleSaveRecipe(id: string, recipeId: string): Promise<{ message: string, isSaved: boolean }>;
    unSaveRecipe(id: string, recipeId: string): Promise<void>;
    getSavedRecipes(id: string, page: number, limit: number): Promise<{ data: IRecipeDto[], currentPage: number, totalPages: number, message: string }>;
    getRecentRecipes(limit: number): Promise<{ data: IRecipeDto[] }>;
}