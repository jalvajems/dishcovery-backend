import { IFoodieDto, IFoodieProfileDto } from "../../dtos/foodie.dtos";
import { IRecipeDto } from "../../dtos/recipe.dtos";

export interface IFoodieService {
    getAllRecipes(): Promise<{ data: IRecipeDto[], message: string }>;
    getRecipeDetail(id: string, userId: string): Promise<{ data: IRecipeDto, isSaved: boolean | undefined, message: string }>;
    createProfile(userId: string, data: IFoodieProfileDto): Promise<{ data: IFoodieDto }>
    updateProfile(userId: string, data: IFoodieProfileDto): Promise<{ data: IFoodieDto }>
    getProfile(userId: string): Promise<{ data: IFoodieDto | boolean }>
}