import { IUserDto } from "../../dtos/user.dtos";
import { IChef } from "../../types/chef.types";
import { IUser } from "../../types/user.types";
import { IReviewDocument } from "../../models/review.model";
import { IChefProfileDto } from "../../dtos/chef.dtos";
import { IChefDocument } from "../../models/chef.model";

export interface IChefService {
    createProfile(chefId: string, data: IChefProfileDto): Promise<{ data: IChefDocument }>;
    updateProfile(chefId: string, data: IChefProfileDto): Promise<{ user: IUser, chef: IChefDocument }>;
    getProfile(chefId: string): Promise<{ data: IChefDocument | boolean; reviews?: IReviewDocument[] }>;
    getUser(id: string): Promise<{ data: IUserDto }>;
    getAllChefs(page: number, limit: number, search: string, filter?: string): Promise<{ datas: IChefDocument[]; totalCount: number }>;
    getChefDetails(chefId: string): Promise<{ data: IChefDocument }>;
    getDashboardStats(chefId: string): Promise<{ totalRecipes: number; averageRating: number; totalFollowers: number; totalWorkshops: number }>;
}