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

@injectable()
export class RecipeService implements IRecipeService {
    constructor(
        @inject(TYPES.IRecipeRepository) private _recipeRepository: IRecipeRepository,
        @inject(TYPES.ISaveRepository) private _saveRepository: ISaveRepository,
    ) { }


    async createRecipe(recipeData: IRecipe): Promise<{ message: string; }> {
        try {
            console.log('here1', recipeData);

            await this._recipeRepository.create(recipeData);
            log.info('recipe created');
            return { message: 'Recipe created successfully!!' }
        } catch (error) {
            throw error;
        }
    }
    async editRecipe(id: string, newDate: IRecipe): Promise<{ data: IRecipeDto; message: string; }> {
        try {
            console.log('recidata', newDate);
            console.log('recidata', id);

            const updatedData = await this._recipeRepository.updateById(id, newDate)
            log.info('new recipe data updated!')
            if (!updatedData) throw new AppError('error in updated recipe', STATUS_CODE.INTERNAL_SERVER_ERROR);

            return { data: recipeMapper(updatedData), message: 'new recipe data updated!' }
        } catch (error) {
            throw error;
        }
    }
    async getAllRecipesChef(chefId: string, page: number, limit: number, search: string): Promise<{ data: IRecipeDto[]; currentPage: number; totalPages: number; message: string; }> {
        try {
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
        } catch (error) {
            throw error
        }
    }
    async getAllRecipes(page: number, limit: number, search: string, filter?: string): Promise<{ datas: IRecipeDto[]; currentPage: number; totalPage: number; }> {
        try {
            const skip = (page - 1) * limit
            const result = await this._recipeRepository.findAllByPagination(search, skip, limit, 'foodie', filter)
            let total = Math.ceil(result.totalCount / limit)

            return { datas: allRecipesMapper(result.datas), currentPage: page, totalPage: total }
        } catch (error) {
            throw error;
        }
    }
    async getRecipeDetail(id: string, userId: string): Promise<{ data: IRecipeDto; message: string; }> {
        try {
            const recipeData = await this._recipeRepository.findByIdandPopulate(id)
            if (!recipeData) throw new AppError('no recipe data found', STATUS_CODE.NOT_FOUND)
            console.log('recipedetail in service==========', recipeData);

            const user = await this._saveRepository.findById(userId!);

            const isSaved = user?.savedRecipes.includes(recipeData?._id);


            return { data: recipeMapper(recipeData), message: 'recipe data send' }
        } catch (error) {
            throw error
        }
    }
    async deleteRecipe(id: string): Promise<{ message: string; }> {
        try {
            await this._recipeRepository.deleteById(id);
            return { message: 'Recipe deleted successfully!' };
        } catch (error) {
            throw error;
        }
    }
    async getRelatedRecipes(cuisine: string): Promise<{ datas: IRecipeDto[]; message: string; }> {
        try {
            const result = await this._recipeRepository.findByCuisine(cuisine);
            if (!result) throw new AppError('No related datas', STATUS_CODE.NOT_FOUND)

            return { datas: allRecipesMapper(result), message: 'related data fetched successfuly' }
        } catch (error) {
            throw error;
        }
    }
    async toggleSaveRecipe(id: string, recipeId: string): Promise<{ message: string, isSaved: boolean }> {
        try {
            const user = await this._saveRepository.findById(id);
            const isSaved = user?.savedRecipes.includes(recipeId)
            if (!isSaved) {
                await this._saveRepository.saveRecipe(id, recipeId)
                return { message: 'recipe saved', isSaved: true }
            } else {
                await this._saveRepository.unSaveRecipe(id, recipeId)
                return { message: 'unsaved recipe', isSaved: false }
            }
        } catch (error) {
            throw error;
        }
    }
    async unSaveRecipe(id: string, recipeId: string): Promise<void> {
        try {
            await this._saveRepository.unSaveRecipe(id, recipeId);
        } catch (error) {
            throw error;
        }
    }
    async getSavedRecipes(id: string): Promise<object> {
        try {
            const result = await this._saveRepository.getSavedRecipes(id);
            console.log('result recipe saved', result)
            if (!result) throw new AppError('result is empty', STATUS_CODE.NOT_FOUND)
            return result;
        } catch (error) {
            throw error;
        }
    }

}