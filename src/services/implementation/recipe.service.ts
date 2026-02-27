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
import { ISaveRepository } from "../../repostories/interface/ISaveRepository";
import { Role } from "../../types/user.types";
import { RECIPE_MESSAGES } from "../../constants/Message";

@injectable()
export class RecipeService implements IRecipeService {
    constructor(
        @inject(TYPES.IRecipeRepository) private _recipeRepository: IRecipeRepository,
        @inject(TYPES.ISaveRepository) private _saveRepository: ISaveRepository,
    ) { }


    async createRecipe(recipeData: IRecipe): Promise<{ message: string; }> {
        console.log('here1', recipeData);

        await this._recipeRepository.create(recipeData);
        log.info('recipe created');
        return { message: RECIPE_MESSAGES.CREATED }
    }
    async editRecipe(recipeId: string, newDate: IRecipe): Promise<{ data: IRecipeDto; message: string; }> {
        console.log('recidata', newDate);
        console.log('recidata', recipeId);

        const updatedData = await this._recipeRepository.updateById(recipeId, newDate)
        log.info('new recipe data updated!')
        if (!updatedData) throw new AppError('error in updated recipe', STATUS_CODE.INTERNAL_SERVER_ERROR);

        return { data: recipeMapper(updatedData), message: RECIPE_MESSAGES.UPDATED }
    }
    async getAllRecipesChef(chefId: string, page: number, limit: number, search: string): Promise<{ data: IRecipeDto[]; currentPage: number; totalPages: number; message: string; }> {
        const skip = (page - 1) * limit;
        const result = await this._recipeRepository.findRecipesById(chefId, skip, limit, search)
        const total = Math.ceil(result.totalCount / limit)
        console.log('data in id', chefId)
        console.log('data in search', search)
        console.log('result', result);

        console.log('resule==========', result);

        return {
            data: allRecipesMapper(result.datas),
            currentPage: page,
            totalPages: total,
            message: 'all recipes got successfully!!'
        }
    }
    async getAllRecipes(page: number, limit: number, search: string, filter?: string): Promise<{ datas: IRecipeDto[]; currentPage: number; totalPage: number; }> {
        const skip = (page - 1) * limit
        const result = await this._recipeRepository.findAllByPagination(search, skip, limit, Role.FOODIE, filter)
        const total = Math.ceil(result.totalCount / limit)

        return { datas: allRecipesMapper(result.datas), currentPage: page, totalPage: total }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getRecipeDetail(recipeId: string, userId: string): Promise<{ data: IRecipeDto; message: string; }> {
        const recipeData = await this._recipeRepository.findByIdandPopulate(recipeId)
        if (!recipeData) throw new AppError(RECIPE_MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND)
        console.log('recipedetail in service==========', recipeData);

        return { data: recipeMapper(recipeData), message: RECIPE_MESSAGES.FETCHED }
    }
    async deleteRecipe(recipeId: string): Promise<{ message: string; }> {
        await this._recipeRepository.deleteById(recipeId);
        return { message: RECIPE_MESSAGES.DELETED };
    }
    async getRelatedRecipes(cuisine: string): Promise<{ datas: IRecipeDto[]; message: string; }> {
        const result = await this._recipeRepository.findByCuisine(cuisine);
        if (!result) throw new AppError(RECIPE_MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND)

        return { datas: allRecipesMapper(result), message: RECIPE_MESSAGES.FETCHED }
    }
    async toggleSaveRecipe(id: string, recipeId: string): Promise<{ message: string, isSaved: boolean }> {
        const user = await this._saveRepository.findById(id);
        const isSaved = user?.savedRecipes.includes(recipeId)
        if (!isSaved) {
            await this._saveRepository.saveRecipe(id, recipeId)
            return { message: RECIPE_MESSAGES.SAVED, isSaved: true }
        } else {
            await this._saveRepository.unSaveRecipe(id, recipeId)
            return { message: RECIPE_MESSAGES.UNSAVED, isSaved: false }
        }
    }
    async unSaveRecipe(id: string, recipeId: string): Promise<void> {
        await this._saveRepository.unSaveRecipe(id, recipeId);
    }
    async getSavedRecipes(id: string): Promise<object> {
        const result = await this._saveRepository.getSavedRecipes(id);
        console.log('result recipe saved', result)
        if (!result) throw new AppError(RECIPE_MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND)
        return result;
    }

    async getRecentRecipes(limit: number): Promise<{ data: IRecipeDto[]; }> {
        const result = await this._recipeRepository.findRecent(limit);
        return { data: allRecipesMapper(result) }
    }
}