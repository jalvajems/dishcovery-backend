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
import { Types } from "mongoose";
import { IUserRepository } from "../../repostories/interface/IUserRepository";

@injectable()
export class FoodieService implements IFoodieService {
    constructor(
        @inject(TYPES.IFoodieRepository) private _foodieRepository: IFoodieRepository,
        @inject(TYPES.IRecipeRepository) private _recipeRepository: IRecipeRepository,
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository
    ) { }


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

    async createProfile(userId:string,data: object): Promise<{ data: IFoodieDto; }> {
        try {
            console.log('userid',userId);
            
            const exist=await this._foodieRepository.getByUserId(userId)
            if(exist)throw new AppError("profile already exist",STATUS_CODE.NOT_FOUND);
            console.log('1')
            const result=await this._foodieRepository.create({userId,...data})
        return {data:foodieMapper(result)}
        } catch (error) {
            throw error;
        }
    }
    async updateProfile(userId: string, data: object): Promise<{ data: IFoodieDto; }> {
        try {
            const {name,phone,location,preferences,bio,image}:any=data;
            
            await this._userRepository.findByIdAndUpdate(userId,{name})
            const updateData: any = { phone, location, preferences, bio };
            if (image) updateData.image = image;
            const result=await this._foodieRepository.findOneUpdateFoodie(userId,updateData)
            if(!result)throw new AppError("Updated data not found",STATUS_CODE.NOT_FOUND)
                console.log('result in fodieservice',result);
                
            return {data:foodieMapper(result)}
        } catch (error) {
            throw error;
        }
    }
    async getProfile(userId: string): Promise<{ data: IFoodieDto; }> {
    try {
        const result=await this._foodieRepository.getByUserId(userId)
        console.log('profildata',result);
        ;
        if(!result)throw new AppError("foodie profile data not found",STATUS_CODE.NOT_FOUND)
            return{data:foodieMapper(result)}
    } catch (error) {
        throw error;
    }
    }
}