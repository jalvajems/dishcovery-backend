import { inject, injectable } from "inversify";
import { IAdminService } from "../interface/IAdminService";
import TYPES from "../../DI/types";
import { IUserRepository } from "../../repostories/interface/IUserRepository";
import { userMapper } from "../../utils/mapper/user.mapper";
import { usersMapper } from "../../utils/mapper/allUser.mapper";
import { IUserDto } from "../../dtos/user.dtos";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { IPaginationDto } from "../../dtos/IPaginationDto";
import { IRecipeDto } from "../../dtos/recipe.dtos";
import { IRecipeRepository } from "../../repostories/interface/IRecipeRepository";
import { allRecipesMapper } from "../../utils/mapper/allRecipes.mapper";
import { recipeMapper } from "../../utils/mapper/recipe.mapper";

@injectable()
export class AdminService implements IAdminService {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.IRecipeRepository) private _recipeRepository: IRecipeRepository
    ) { }

    async getAllFoodies(query: IPaginationDto): Promise<{ data: IUserDto[]; currentPage: number; totalPages: number }> {
        try {
            
            const { page, limit, search, isBlocked } = query;
            const filter: any = { role: "user" };
    
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ]
            }
            if (isBlocked === "true") filter.isBlocked = true;
            if (isBlocked === "false") filter.isBlocked = false;
    
    
            const skip = (page - 1) * limit;
    
            const users = await this._userRepository.findByRole(filter, skip, limit)
            const totalCount = await this._userRepository.countDocuments(filter)
    
            let total = Math.ceil(totalCount / limit)
    
            return {
                data: usersMapper(users),
                currentPage: page,
                totalPages: total,
            }
        } catch (error) {
           throw error
        }

    }
    async getAllChefs(query: IPaginationDto): Promise<{ data: IUserDto[]; currentPage: number; totalPages: number; }> {
        
        try {
            const { page, limit, search, isBlocked, isVerified } = query;
            const skip = (page - 1) * limit;
            const filter: any = { role: "chef" };
    
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ]
            }
            if (isBlocked === "true") filter.isBlocked = true;
            if (isBlocked === "false") filter.isBlocked = false;
    
            if (isVerified === "true") filter.isVerified = true;
            if (isVerified === "false") filter.isVerified = false;
            const users = await this._userRepository.findByRole(filter, skip, limit)
            const totalCount = await this._userRepository.countDocuments(filter)
            return {
                data: usersMapper(users),
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
            }
        } catch (error) {
           throw error
        }
    }
    async blockUserById(id: string): Promise<IUserDto> {
        try {
            const result = await this._userRepository.blockById(id);
            if (!result) throw new AppError('result is empty', STATUS_CODE.INTERNAL_SERVER_ERROR);
            return userMapper(result);
        } catch (error) {
           throw error
        }

    }
    async unBlockUserById(id: string): Promise<IUserDto> {
        try {
            const result = await this._userRepository.unblockById(id);
            if (!result) throw new AppError('result is empty', STATUS_CODE.INTERNAL_SERVER_ERROR);
            return userMapper(result);
        } catch (error) {
            throw error;
        }

    }
    async verifyChef(id: string): Promise<IUserDto> {
        const result = await this._userRepository.verifyById(id);
        if (!result) throw new AppError('user in empty', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return userMapper(result)
    }
    async unVerifyChef(id: string): Promise<IUserDto> {
        try {
            const result = await this._userRepository.unVerifyById(id);
            if (!result) throw new AppError('user is empty', STATUS_CODE.INTERNAL_SERVER_ERROR);
            return userMapper(result);
        } catch (error) {
            throw error;
        }
    }
    // async getAllRecipes(query: IPaginationDto): Promise<{ data: IRecipeDto[]; currentPage: number; totalPages: number; }> {
    //     try {
    //         const {page,limit,search,isBlocked}=query;
    //         const filter:any={}
    //         if(search){
    //             filter.$or=[
    //                 {title:{ $regex:search, $option:"i"}}
    //             ]
    //         }
    //         if(isBlocked==="true")filter.isBlocked=true;
    //         if(isBlocked==="false")filter.isBlocked=false;

    //         const skip=(page-1)*limit;

    //         const recipes=await this._recipeRepository.findAllByPagination(filter,skip,limit)
    //         const totalCount=await this._recipeRepository.countDocument(filter)

    //         let total=Math.ceil(totalCount/limit)

    //         return {
    //             data:allRecipesMapper(recipes),
    //             currentPage:page,
    //             totalPages:total
    //         }
    //     } catch (error) {
    //         throw error;
    //     }
    // }
    // async blockRecipe(id: string): Promise<IRecipeDto> {
    //     try {
    //         const result=this._recipeRepository.blockById(id)
    //         if(!result)throw new AppError('recipe is not fount',STATUS_CODE.INTERNAL_SERVER_ERROR);
    //         return recipeMapper(result)
    //     } catch (error) {
    //         throw error
    //     }
    // }
    // async unblockRecipe(id: string): Promise<IRecipeDto> {
    //     try {
    //         const result=this._recipeRepository.unblockById(id)
    //         if(!result)throw new AppError('recipe is not fount',STATUS_CODE.INTERNAL_SERVER_ERROR);
    //         return recipeMapper(result)
            
    //     } catch (error) {
    //         throw error
    //     }
    // }

}