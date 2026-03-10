import { IBlogDto } from "../../dtos/blog.dto";
import { IFoodSpotResDto } from "../../dtos/foodSpot.dtos";
import { IPaginationDto } from "../../dtos/IPaginationDto";
import { IRecipeDto } from "../../dtos/recipe.dtos";
import { IUserDto } from "../../dtos/user.dtos";

import { IDashboardStats, IGrowthData } from "../../dtos/admin.dtos";

export interface IAdminService {
    getAllFoodies(query: IPaginationDto): Promise<{ data: IUserDto[], currentPage: number, totalPages: number }>;
    getAllChefs(query: IPaginationDto): Promise<{ data: IUserDto[]; currentPage: number; totalPages: number; }>;
    blockUserById(userId: string): Promise<IUserDto>;
    unBlockUserById(userId: string): Promise<IUserDto>;
    verifyChef(chefId: string): Promise<IUserDto>;
    unVerifyChef(chefId: string): Promise<IUserDto>;
    getAllRecipes(query: IPaginationDto): Promise<{ data: IRecipeDto[], currentPage: number, totalPages: number }>;
    blockRecipe(recipeId: string): Promise<void>;
    unblockRecipe(recipeId: string): Promise<void>;
    getAllBlogs(query: IPaginationDto): Promise<{ data: IBlogDto[], currentPage: number, totalPages: number }>
    blockBlog(blogId: string): Promise<void>;
    unblockBlog(blogId: string): Promise<void>;
    getAllFoodSpot(query: IPaginationDto): Promise<{ data: IFoodSpotResDto[], currentPage: number, totalPages: number }>
    blockSpot(spotId: string): Promise<void>;
    unblockSpot(spotId: string): Promise<void>;
    approveSpot(spotId: string): Promise<void>;
    unapproveSpot(spotId: string): Promise<void>;
    getDashboardStats(): Promise<IDashboardStats>;
    getGrowthData(): Promise<IGrowthData>;
}