import { inject, injectable } from "inversify";
import { IRecipe } from "../../types/recipe.types";
import { IRecipeService } from "../interface/IRecipeService";
import TYPES from "../../DI/types";
import { IRecipeRepository } from "../../repostories/interface/IRecipeRepository";
import { log } from "../../utils/logger";
import { IRecipeDto } from "../../dtos/recipe.dtos";
import { recipeMapper } from "../../utils/mapper/recipe.mapper";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { allRecipesMapper } from "../../utils/mapper/allRecipes.mapper";

@injectable()
export class RecipeService implements IRecipeService{
    constructor(
        @inject(TYPES.IRecipeRepository) private _recipeRepository:IRecipeRepository,
    ){}


    async createRecipe(recipeData: IRecipe): Promise<{ message: string; }> {
        try {
            await this._recipeRepository.create(recipeData);
            log.info('recipe created');
            return {message:'Recipe created successfully!!'}
        } catch (error) {
            throw error;
        }
    }
    async editRecipe(id: string, newDate: IRecipe): Promise<{ data: IRecipeDto; message: string; }> {
        try {
            const updatedData= await this._recipeRepository.updateById(id,newDate)
             log.info('new recipe data updated!')
             if(!updatedData)throw new AppError('error in updated recipe',STATUS_CODE.INTERNAL_SERVER_ERROR);

             return {data:recipeMapper(updatedData),message:'new recipe data updated!'}
        } catch (error) {
            throw error;   
        }
    }
    async getAllRecipes(chefId: string): Promise<{ data: IRecipeDto[]; message: string; }> {
        try {
            const recipes=await this._recipeRepository.findAll({chefId})
            return {data:allRecipesMapper(recipes),message:'all recipes got successfully!!'}
        } catch (error) {
            throw error   
        }
    }
    async getRecipeDetail(id: string): Promise<{ data: IRecipeDto; message: string; }> {
        try {
            const recipeData=await this._recipeRepository.findById(id)
            if(!recipeData)throw new AppError('no recipe data found',STATUS_CODE.NOT_FOUND)
            return {data:recipeMapper(recipeData),message:'recipe data send'}
        } catch (error) {
            throw error
        }
    }

}