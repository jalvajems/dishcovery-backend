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
import { IBlogRepository } from "../../repostories/interface/IBlogRepository";
import { allBlogsMapper } from "../../utils/mapper/allBlogs.mapper";
import { IBlogDto } from "../../dtos/blog.dto";
import { IChefRepository } from "../../repostories/interface/IChefRepository";
import { IFoodSpotResDto } from "../../dtos/foodSpot.dtos";
import { IFoodSpotRepository } from "../../repostories/interface/IFoodSportRepository";
import { allFoodSpotsMapper } from "../../utils/mapper/allFoodSpot. mapper";
import { logger } from "../../utils/logger";

@injectable()
export class AdminService implements IAdminService {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.IChefRepository) private _chefRepository: IChefRepository,
        @inject(TYPES.IRecipeRepository) private _recipeRepository: IRecipeRepository,
        @inject(TYPES.IBlogRepository) private _blogRepository: IBlogRepository,
        @inject(TYPES.IFoodSpotRepository) private _foodspotRepository: IFoodSpotRepository,
        
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
    async verifyChef(id: string): Promise<object> {
        const result = await this._userRepository.verifyById(id);
        console.log('verifeid data chef',result);
        
        if (!result) throw new AppError('user in empty', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return result
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
    async getAllRecipes(query: IPaginationDto): Promise<{ data: IRecipeDto[]; currentPage: number; totalPages: number; }> {
        try {
            const {page,limit,search,isBlocked}=query;
            const filter:any={}
            if(search){
                filter.$or=[
                    {title:{ $regex:search, $option:"i"}}
                ]
            }
            if(isBlocked==="true")filter.isBlocked=true;
            if(isBlocked==="false")filter.isBlocked=false;

            const skip=(page-1)*limit;
            
            const recipes=await this._recipeRepository.findAllByPagination(filter,skip,limit,'admin')
            const totalCount=await this._recipeRepository.countDocument(filter)
            console.log('recipes=========',recipes.datas);
            
            let total=Math.ceil(totalCount/limit)
            
            return {
                data:allRecipesMapper(recipes.datas),
                currentPage:page,
                totalPages:total
            }
        } catch (error) {
            throw error;
        }
    }
    async blockRecipe(id: string): Promise<void> {
        try {
            const result=this._recipeRepository.blockById(id)
            if(!result)throw new AppError('recipe is not fount',STATUS_CODE.INTERNAL_SERVER_ERROR);
        } catch (error) {
            throw error
        }
    }
    async unblockRecipe(id: string): Promise<void> {
        try {
            const result=this._recipeRepository.unblockById(id)
            if(!result)throw new AppError('recipe is not fount',STATUS_CODE.INTERNAL_SERVER_ERROR);
            
        } catch (error) {
            throw error
        }
    }
    async getAllBlogs(query: IPaginationDto): Promise<{ data: IBlogDto[]; currentPage: number; totalPages: number; }> {
        try {
            const {page,limit,search,isBlocked}=query;
            const filter:any={}
            if(search){
                filter.$or=[
                    {title:{ $regex:search, $option:"i"}}
                ]
            }
            if(isBlocked==="true")filter.isBlocked=true;
            if(isBlocked==="false")filter.isBlocked=false;
        
            const skip=(page-1)*limit;

            const blogs=await this._blogRepository.getAllBlogs(search,skip,limit,'admin')
            if(!blogs.datas)throw new AppError('blog data not found',STATUS_CODE.NOT_FOUND)
            const total=Math.ceil(blogs.totalCount/limit)
            return {
                data:allBlogsMapper(blogs.datas),currentPage:page,totalPages:total
            }
            
        } catch (error) {
            throw error
        }
    }
    async blockBlog(id: string): Promise<void> {
        try {
            const result=await this._blogRepository.blockById(id)
            if(!result)throw new AppError("updated blog not found",STATUS_CODE.NOT_FOUND)
            } catch (error) {
        throw error
    }
    
}
async unblockBlog(id: string): Promise<void> {
    try {
        const result=await this._blogRepository.unblockById(id)
        if(!result)throw new AppError("updated blog not found",STATUS_CODE.NOT_FOUND)
        } catch (error) {
            throw error
        }    
    }

    async getAllFoodSpot(query: IPaginationDto): Promise<{ data: IFoodSpotResDto[]; currentPage: number; totalPages: number; }> {
        try {
            const {page,limit,search,isBlocked,isApproved}=query;
            console.log('inside query',query);
            
            const skip=(page-1)*limit;
            const filter:any={}
            if(search){
                filter.$or = [
                      { name: { $regex: search, $options: "i" } },
                  ]
            }
            console.log('isblocked ',isBlocked);
            console.log('isaprove ',isApproved);
            
            if (isBlocked === "blocked") filter.isBlocked = true;
            if (isBlocked === "active") filter.isBlocked = false;
            if (isApproved === "approved") filter.isApproved = true;
            if (isApproved === "pending") filter.isApproved = false;

            const spots=await this._foodspotRepository.findAllFoodSpotsAdmin(filter,skip,limit)
                        logger.info('====spotcont',spots)

            if(!spots.datas)throw new AppError('spot not found',STATUS_CODE.NOT_FOUND)

            return {data:allFoodSpotsMapper(spots.datas),currentPage:page,totalPages:Math.ceil(spots.totalCount / limit)}

        } catch (error) {
            throw error;
        }
        
    }
    async blockSpot(id: string): Promise<void> {
        try {
            const result=await this._foodspotRepository.blockById(id)
            if(!result)throw new AppError("updated blog not found",STATUS_CODE.NOT_FOUND)

        } catch (error) {
            throw error;
        }
    }
    async unblockSpot(id: string): Promise<void> {
        try {
            const result=await this._foodspotRepository.unblockById(id)
            if(!result)throw new AppError("updated blog not found",STATUS_CODE.NOT_FOUND)

        } catch (error) {
            throw error;
        }
    }
    async approveSpot(id: string): Promise<void> {
        try {
            const result=await this._foodspotRepository.approveById(id)
            if(!result)throw new AppError("updated blog not found",STATUS_CODE.NOT_FOUND)

        } catch (error) {
            throw error;
        }
    }
    async unapproveSpot(id: string): Promise<void> {
        try {
            const result=await this._foodspotRepository.unAproveById(id)
            if(!result)throw new AppError("updated blog not found",STATUS_CODE.NOT_FOUND)

        } catch (error) {
            throw error;
        }
    }



}