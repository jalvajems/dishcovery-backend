import { IUserDto } from "../../dtos/user.dtos";
import { IUser } from "../../types/user.types";
import { IReviewDocument } from "../../models/review.model";
import { IChefProfileDto } from "../../dtos/chef.dtos";
import { IChefDocument } from "../../models/chef.model";

import { IChef } from "../../types/chef.types";

export interface IChefService {
    createProfile(chefId: string, data: IChefProfileDto): Promise<{ data: IChef }>;
    updateProfile(chefId: string, data: IChefProfileDto): Promise<{ user: IUserDto, chef: IChef }>;
    getProfile(chefId: string): Promise<{ data: IChef | boolean; reviews?: IReviewDocument[] }>;
    getUser(id: string): Promise<{ data: IUserDto }>;
    getAllChefs(page: number, limit: number, search: string, filter?: string): Promise<{ datas: IChefDocument[]; totalCount: number }>;
    getChefDetails(chefId: string): Promise<{ data: IChef }>;
    getDashboardStats(chefId: string): Promise<{ totalRecipes: number; averageRating: number; totalFollowers: number; totalWorkshops: number }>;
}