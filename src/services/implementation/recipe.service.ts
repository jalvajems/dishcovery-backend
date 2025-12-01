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
            console.log('recidata',newDate);
            console.log('recidata',id);
            
            const updatedData= await this._recipeRepository.updateById(id,newDate)
             log.info('new recipe data updated!')
             if(!updatedData)throw new AppError('error in updated recipe',STATUS_CODE.INTERNAL_SERVER_ERROR);

             return {data:recipeMapper(updatedData),message:'new recipe data updated!'}
        } catch (error) {
            throw error;   
        }
    }
    async getAllRecipesChef(chefId: string,page:number,limit:number,search:string): Promise<{ data: IRecipeDto[];currentPage:number; totalPages:number; message: string; }> {
        try {
            const skip=(page-1)*limit;
            console.log('=>id',chefId);
            
            const result=await this._recipeRepository.findRecipesById(chefId,skip,limit,search)
            const total=Math.ceil(result.totalCount/limit)
            console.log('data in search',chefId)
            console.log('data in srvs',search)
            console.log('result',result);
            
            return {data:allRecipesMapper(result.datas),
                currentPage:page,
                totalPages:total,
                message:'all recipes got successfully!!'}
        } catch (error) {
            throw error   
        }
    }
    async getAllRecipes(page: number, limit: number, search:string): Promise<{ datas: IRecipeDto[]; currentPage: number; totalPage: number; }> {
        try {
            const skip=(page-1)*limit
            const result=await this._recipeRepository.findAllByPagination(search,skip,limit)
            let total=Math.ceil(result.totalCount/limit)
            return {datas:allRecipesMapper(result.datas),currentPage:page,totalPage:total}
        } catch (error) {
            throw error;
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
    async deleteRecipe(id: string): Promise<{ message: string; }> {
        try {
            await this._recipeRepository.deleteById(id);
            return {message:'Recipe deleted successfully!'};
        } catch (error) {
            throw error;
        }
    }
    async getRelatedRecipes(cuisine: string): Promise<{ datas: IRecipeDto[]; message: string; }> {
        try {
            const result= await this._recipeRepository.findByCuisine(cuisine);
            if(!result)throw new AppError('No related datas',STATUS_CODE.NOT_FOUND)

            return {datas:allRecipesMapper(result),message:'related data fetched successfuly'}
        } catch (error) {
            throw error;
        }
    }

}