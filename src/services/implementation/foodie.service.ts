import { inject, injectable } from "inversify";
import { IFoodieService } from "../interface/IFoodieService";
import TYPES from "../../DI/types";
import { IFoodieRepository } from "../../repostories/interface/IFoodieRepository";
import { IFoodie } from "../../types/foodie.types";
import foodieMapper from '../../utils/mapper/foodie.mapper'
import { IFoodieDto } from "../../dtos/foodie.dtos";
import { IRecipeDto } from "../../dtos/recipe.dtos";
import { IRecipeRepository } from "../../repostories/interface/IRecipeRepository";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { allRecipesMapper } from "../../utils/mapper/allRecipes.mapper";
import { recipeMapper } from "../../utils/mapper/recipe.mapper";

@injectable()
export class FoodieService implements IFoodieService {
    constructor(
        @inject(TYPES.IFoodieRepository) private _foodieRepository: IFoodieRepository,
        @inject(TYPES.IRecipeRepository) private _recipeRepository: IRecipeRepository,
    ) { }


    async editFoodieProfile(userId: string, foodieData: IFoodieDto): Promise<{ message: string; foodieData: IFoodieDto | IFoodie | null; }> {
        try {
            const existingFoodie = await this._foodieRepository.findByUserId(userId);
            if (!existingFoodie) {
                const newFoodie = await this._foodieRepository.create(foodieData);
                return { message: 'foodie profile data created', foodieData: foodieMapper(newFoodie) };
            }
            const updateFoodie = await this._foodieRepository.findOneUpdateFoodie(userId, foodieData);
            return { message: 'foodie profile updated', foodieData: updateFoodie }

        } catch (error) {
            throw new Error('Error in edit foodie profile service:');
        }
    }
    async getAllRecipes(): Promise<{ data: IRecipeDto[]; message: string; }> {
        try {
            const result=await this._recipeRepository.findAll({})
            if(!result)throw new AppError('No recipes found!',STATUS_CODE.NOT_FOUND);
            return {data:allRecipesMapper(result),message:'All recipe fetched!'}
        } catch (error) {
            throw error;
        }
    }
    async getRecipeDetail(id: string): Promise<{ data: IRecipeDto; message: string; }> {
        try {
            console.log('reached');
            
            const result=await this._recipeRepository.findByIdandPopulate(id)
            console.log('res===',result);
            
            if(!result)throw new AppError("no recipe data found",STATUS_CODE.NOT_FOUND);
            return {data:recipeMapper(result),message:'Recipe data fetched successfully'};
        } catch (error) {
            throw error;
        }
    }
}