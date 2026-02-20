import { IBlogDto } from "../../dtos/blog.dto";
import { IFoodSpotResDto } from "../../dtos/foodSpot.dtos";
import { IPaginationDto } from "../../dtos/IPaginationDto";
import { IRecipeDto } from "../../dtos/recipe.dtos";
import { IUserDto } from "../../dtos/user.dtos";

import { IDashboardStats, IGrowthData } from "../../dtos/admin.dtos";

export interface IAdminService {
    getAllFoodies(query: IPaginationDto): Promise<{ data: IUserDto[], currentPage: number, totalPages: number }>;
    getAllChefs(query: IPaginationDto): Promise<{ data: IUserDto[]; currentPage: number; totalPages: number; }>;
    blockUserById(id: string): Promise<IUserDto>;
    unBlockUserById(id: string): Promise<IUserDto>;
    verifyChef(id: string): Promise<object>;
    unVerifyChef(id: string): Promise<IUserDto>;
    getAllRecipes(query: IPaginationDto): Promise<{ data: IRecipeDto[], currentPage: number, totalPages: number }>;
    blockRecipe(id: string): Promise<void>;
    unblockRecipe(id: string): Promise<void>;
    getAllBlogs(query: IPaginationDto): Promise<{ data: IBlogDto[], currentPage: number, totalPages: number }>
    blockBlog(id: string): Promise<void>;
    unblockBlog(id: string): Promise<void>;
    getAllFoodSpot(query: IPaginationDto): Promise<{ data: IFoodSpotResDto[], currentPage: number, totalPages: number }>
    blockSpot(id: string): Promise<void>;
    unblockSpot(id: string): Promise<void>;
    approveSpot(id: string): Promise<void>;
    unapproveSpot(id: string): Promise<void>;
    getDashboardStats(): Promise<IDashboardStats>;
    getGrowthData(): Promise<IGrowthData>;
}