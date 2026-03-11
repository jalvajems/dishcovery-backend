import { inject, injectable } from "inversify";
import { IAdminService } from "../interface/IAdminService";
import { Role } from "../../types/user.types";
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
import { IBlogRepository } from "../../repostories/interface/IBlogRepository";
import { allBlogsMapper } from "../../utils/mapper/allBlogs.mapper";
import { IBlogDto } from "../../dtos/blog.dto";
import { IChefRepository } from "../../repostories/interface/IChefRepository";
import { IFoodSpotResDto } from "../../dtos/foodSpot.dtos";
import { IFoodSpotRepository } from "../../repostories/interface/IFoodSportRepository";
import { allFoodSpotsMapper } from "../../utils/mapper/allFoodSpot. mapper";
import { IWorkshopRepository } from "../../repostories/interface/IWorkshopRepository";
import { logger } from "../../utils/logger";
import { IDashboardStats, IGrowthData } from "../../dtos/admin.dtos";

@injectable()
export class AdminService implements IAdminService {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.IChefRepository) private _chefRepository: IChefRepository,
        @inject(TYPES.IRecipeRepository) private _recipeRepository: IRecipeRepository,
        @inject(TYPES.IBlogRepository) private _blogRepository: IBlogRepository,
        @inject(TYPES.IFoodSpotRepository) private _foodspotRepository: IFoodSpotRepository,
        @inject(TYPES.IWorkshopRepository) private _workshopRepository: IWorkshopRepository,

    ) { }

    async getAllFoodies(query: IPaginationDto): Promise<{ data: IUserDto[]; currentPage: number; totalPages: number }> {
        const { page, limit, search, isBlocked } = query;
        const filter: Record<string, unknown> = { role: Role.USER };

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

        const total = Math.ceil(totalCount / limit)

        return {
            data: usersMapper(users),
            currentPage: page,
            totalPages: total,
        }

    }
    async getAllChefs(query: IPaginationDto): Promise<{ data: IUserDto[]; currentPage: number; totalPages: number; }> {

        const { page, limit, search, isBlocked, isVerified } = query;
        const skip = (page - 1) * limit;
        const filter: Record<string, unknown> = { role: Role.CHEF };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ]
        }
        if (isBlocked === "blocked") filter.isBlocked = true;
        if (isBlocked === "active") filter.isBlocked = false;

        if (isVerified === "verified") filter.isVerified = true;
        if (isVerified === "unverified") filter.isVerified = false;
        const users = await this._userRepository.findByRole(filter, skip, limit)
        const totalCount = await this._userRepository.countDocuments(filter)
        return {
            data: usersMapper(users),
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
        }
    }
    async blockUserById(userId: string): Promise<IUserDto> {
        const result = await this._userRepository.blockById(userId);
        if (!result) throw new AppError('result is empty', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return userMapper(result);

    }
    async unBlockUserById(userId: string): Promise<IUserDto> {
        const result = await this._userRepository.unblockById(userId);
        if (!result) throw new AppError('result is empty', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return userMapper(result);

    }
    async verifyChef(chefId: string): Promise<IUserDto> {
        const result = await this._userRepository.verifyById(chefId);
        console.log('verifeid data chef', result);

        if (!result) throw new AppError('user in empty', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return userMapper(result);
    }
    async unVerifyChef(chefId: string): Promise<IUserDto> {
        const result = await this._userRepository.unVerifyById(chefId);
        if (!result) throw new AppError('user is empty', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return userMapper(result);
    }
    async getAllRecipes(query: IPaginationDto): Promise<{ data: IRecipeDto[]; currentPage: number; totalPages: number; }> {
        const { page, limit, search, isBlocked } = query;
        const filter: Record<string, unknown> = {}
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } }
            ]
        }
        console.log('~~~~',isBlocked)
        if (isBlocked === "blocked") filter.isBlock = true;
        if (isBlocked === "active") filter.isBlock = false;
        
        console.log('~~~~',filter)
        const skip = (page - 1) * limit;

        const recipes = await this._recipeRepository.findAllByPagination(search || "", skip, limit, Role.ADMIN,filter)
        const totalCount = await this._recipeRepository.countDocument(filter)
        console.log('recipes=========', recipes.datas);

        const total = Math.ceil(totalCount / limit)

        return {
            data: allRecipesMapper(recipes.datas),
            currentPage: page,
            totalPages: total
        }
    }
    async blockRecipe(recipeId: string): Promise<void> {
        const result = this._recipeRepository.blockById(recipeId)
        if (!result) throw new AppError('recipe is not fount', STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
    async unblockRecipe(recipeId: string): Promise<void> {
        const result = this._recipeRepository.unblockById(recipeId)
        if (!result) throw new AppError('recipe is not fount', STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
    async getAllBlogs(query: IPaginationDto): Promise<{ data: IBlogDto[]; currentPage: number; totalPages: number; }> {
        const { page, limit, search, isBlocked } = query;
        const filter: Record<string, unknown> = {}
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } }
            ]
        }

        if (isBlocked === "blocked") filter.isBlocked = true;
        if (isBlocked === "active") filter.isBlocked = false;

        const skip = (page - 1) * limit;

        const blogs = await this._blogRepository.getAllBlogs(search, skip, limit, Role.ADMIN, undefined, filter.isBlocked as boolean | undefined)
        if (!blogs.datas) throw new AppError('blog data not found', STATUS_CODE.NOT_FOUND)
        const total = Math.ceil(blogs.totalCount / limit)
        return {
            data: allBlogsMapper(blogs.datas), currentPage: page, totalPages: total
        }
    }
    async blockBlog(blogId: string): Promise<void> {
        const result = await this._blogRepository.blockById(blogId)
        if (!result) throw new AppError("updated blog not found", STATUS_CODE.NOT_FOUND)

    }
    async unblockBlog(blogId: string): Promise<void> {
        const result = await this._blogRepository.unblockById(blogId)
        if (!result) throw new AppError("updated blog not found", STATUS_CODE.NOT_FOUND)
    }

    async getAllFoodSpot(query: IPaginationDto): Promise<{ data: IFoodSpotResDto[]; currentPage: number; totalPages: number; }> {
        const { page, limit, search, isBlocked, isApproved } = query;
        console.log('inside query', query);

        const skip = (page - 1) * limit;
        const filter: Record<string, unknown> = {}
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
            ]
        }
        console.log('isblocked ', isBlocked);
        console.log('isaprove ', isApproved);

        if (isBlocked === "blocked") filter.isBlocked = true;
        if (isBlocked === "active") filter.isBlocked = false;
        if (isApproved === "approved") filter.isApproved = true;
        if (isApproved === "pending") filter.isApproved = false;

        const spots = await this._foodspotRepository.findAllFoodSpotsAdmin(filter, skip, limit)
        logger.info('====spotcont', spots)

        if (!spots.datas) throw new AppError('spot not found', STATUS_CODE.NOT_FOUND)

        return { data: allFoodSpotsMapper(spots.datas), currentPage: page, totalPages: Math.ceil(spots.totalCount / limit) }
    }
    async blockSpot(spotId: string): Promise<void> {
        const result = await this._foodspotRepository.blockById(spotId)
        if (!result) throw new AppError("updated blog not found", STATUS_CODE.NOT_FOUND)
    }
    async unblockSpot(spotId: string): Promise<void> {
        const result = await this._foodspotRepository.unblockById(spotId)
        if (!result) throw new AppError("updated blog not found", STATUS_CODE.NOT_FOUND)
    }
    async approveSpot(spotId: string): Promise<void> {
        const result = await this._foodspotRepository.approveById(spotId)
        if (!result) throw new AppError("updated blog not found", STATUS_CODE.NOT_FOUND)
    }
    async unapproveSpot(spotId: string): Promise<void> {
        const result = await this._foodspotRepository.unAproveById(spotId)
        if (!result) throw new AppError("updated blog not found", STATUS_CODE.NOT_FOUND)
    }



    async getDashboardStats(): Promise<IDashboardStats> {
        const totalUsers = await this._userRepository.countDocuments({ role: Role.USER });
        const totalChefs = await this._userRepository.countDocuments({ role: Role.CHEF });
        const totalRecipes = await this._recipeRepository.countDocument({});
        const totalWorkshops = await this._workshopRepository.countDocument({});
        const totalFoodSpots = await this._foodspotRepository.countDocument({});

        return {
            totalUsers,
            totalChefs,
            totalRecipes,
            totalWorkshops,
            totalFoodSpots
        };
    }

    async getGrowthData(): Promise<IGrowthData> {
        const now = new Date();

        const weeks = [];
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - (i + 1) * 7);
            const weekEnd = new Date(now);
            weekEnd.setDate(now.getDate() - i * 7);

            weeks.push({
                start: weekStart,
                end: weekEnd,
                label: `Week ${4 - i}`
            });
        }

        const recipeGrowth = await Promise.all(
            weeks.map(async (week) => ({
                week: week.label,
                count: await this._recipeRepository.countDocument({
                    createdAt: { $gte: week.start, $lt: week.end }
                })
            }))
        );

        const workshopGrowth = await Promise.all(
            weeks.map(async (week) => ({
                week: week.label,
                count: await this._workshopRepository.countDocument({
                    createdAt: { $gte: week.start, $lt: week.end }
                })
            }))
        );

        const foodSpotGrowth = await Promise.all(
            weeks.map(async (week) => ({
                week: week.label,
                count: await this._foodspotRepository.countDocument({
                    createdAt: { $gte: week.start, $lt: week.end }
                })
            }))
        );

        return {
            recipeGrowth,
            workshopGrowth,
            foodSpotGrowth
        };
    }


}
