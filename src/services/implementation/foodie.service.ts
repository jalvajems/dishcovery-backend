import { inject, injectable } from "inversify";
import { IFoodieService } from "../interface/IFoodieService";
import TYPES from "../../DI/types";
import { IFoodieRepository } from "../../repostories/interface/IFoodieRepository";
import foodieMapper from '../../utils/mapper/foodie.mapper'
import { IFoodieDto, IFoodieProfileDto } from "../../dtos/foodie.dtos";
import { IRecipeDto } from "../../dtos/recipe.dtos";
import { IRecipeRepository } from "../../repostories/interface/IRecipeRepository";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { allRecipesMapper } from "../../utils/mapper/allRecipes.mapper";
import { recipeMapper } from "../../utils/mapper/recipe.mapper";
import { Types } from "mongoose";
import { IUserRepository } from "../../repostories/interface/IUserRepository";
import { ISaveRepository } from "../../repostories/interface/ISaveRepository";
import { IFoodieDocument } from "../../models/foodie.model";
import { FOODIE_MESSAGES, RECIPE_MESSAGES } from "../../constants/Message";

@injectable()
export class FoodieService implements IFoodieService {
    constructor(
        @inject(TYPES.IFoodieRepository) private _foodieRepository: IFoodieRepository,
        @inject(TYPES.IRecipeRepository) private _recipeRepository: IRecipeRepository,
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.ISaveRepository) private _saveRepository: ISaveRepository
    ) { }


    async getAllRecipes(): Promise<{ data: IRecipeDto[]; message: string; }> {
        const result = await this._recipeRepository.findAll({})
        if (!result) throw new AppError(RECIPE_MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);
        return { data: allRecipesMapper(result), message: RECIPE_MESSAGES.FETCHED }
    }
    async getRecipeDetail(id: string, userId: string): Promise<{ data: IRecipeDto; isSaved: boolean | undefined; message: string; }> {
        console.log('reached=', userId);

        const result = await this._recipeRepository.findByIdandPopulate(id)
        if (!result) throw new AppError(RECIPE_MESSAGES.NOT_FOUND, STATUS_CODE.NOT_FOUND);

        const user = await this._saveRepository.findById(userId);
        const recipeId = result._id as Types.ObjectId;

        console.log('issaved in server', user);

        const isSaved = user?.savedRecipes.some(
            (item) => item.toString() === recipeId.toString()
        );

        return { data: recipeMapper(result), isSaved: isSaved, message: RECIPE_MESSAGES.FETCHED };
    }

    async createProfile(userId: string, data: IFoodieProfileDto): Promise<{ data: IFoodieDto; }> {
        console.log('userid', userId);

        const exist = await this._foodieRepository.getByUserId(userId)
        if (exist) throw new AppError(FOODIE_MESSAGES.PROFILE_EXISTED, STATUS_CODE.NOT_FOUND);
        console.log('1')

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { name: _name, ...foodieData } = data;
        const result = await this._foodieRepository.create({ userId, ...foodieData } as Partial<IFoodieDocument>)
        return { data: foodieMapper(result) }
    }
    async updateProfile(userId: string, data: IFoodieProfileDto): Promise<{ data: IFoodieDto; }> {
        const { name, phone, location, preferences, bio, image } = data;

        if (name) {
            await this._userRepository.findByIdAndUpdate(userId, { name })
        }

        const updateData: Partial<IFoodieDocument> = { phone, location, preferences, bio };
        if (image) updateData.image = image;

        const result = await this._foodieRepository.findOneUpdateFoodie(userId, updateData)
        if (!result) throw new AppError(FOODIE_MESSAGES.UPDATED_NOT_FOUND, STATUS_CODE.NOT_FOUND)
        console.log('result in fodieservice', result);

        return { data: foodieMapper(result) }
    }
    async getProfile(userId: string): Promise<{ data: IFoodieDto | boolean; }> {
        const result = await this._foodieRepository.getByUserId(userId)
        console.log('profildata', result);
        if (!result) {
            return { data: false }
        } else {
            return { data: foodieMapper(result) }
        }
    }
}