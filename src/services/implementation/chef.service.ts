import { inject, injectable } from "inversify";
import { IChefService } from "../interface/IChefService";
import TYPES from "../../DI/types";
import { IChefRepository } from "../../repostories/interface/IChefRepository";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { IUserRepository } from "../../repostories/interface/IUserRepository";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IUser } from "../../types/user.types";
import { IUserDto } from "../../dtos/user.dtos";
import { userMapper } from "../../utils/mapper/user.mapper";
import { IReviewRepostory } from "../../repostories/interface/IReviewRepository";
import { RecipeModel } from "../../models/recipe.model";
import { WorkshopModel } from "../../models/workshop.model";
import { FollowModel } from "../../models/follow.model";
import { IChefProfileDto } from "../../dtos/chef.dtos";
import { IChefDocument } from "../../models/chef.model";
import { IReviewDocument } from "../../models/review.model";
import { chefMapper } from "../../utils/mapper/chef.mapper";
import { IChef } from "../../types/chef.types";
import { chefsMapper } from "../../utils/mapper/allChef.mapper";

@injectable()
export class ChefService implements IChefService {
    constructor(
        @inject(TYPES.IChefRepository) private _chefRepository: IChefRepository,
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.IReviewRepository) private _reviewRepository: IReviewRepostory
    ) { }
    async createProfile(chefId: string, data: IChefProfileDto): Promise<{ data: IChef; }> {
        const existing = await this._chefRepository.findByChefId(chefId);
        if (existing) {
            throw new AppError("Profile already exist!", STATUS_CODE.INTERNAL_SERVER_ERROR)
        }

        const result = await this._chefRepository.createProfile({ chefId: chefId, ...data });
        if (!result) throw new AppError('profile creation failed', STATUS_CODE.INTERNAL_SERVER_ERROR)

        return { data: chefMapper(result as IChefDocument) }
    }
    async updateProfile(userId: string, data: IChefProfileDto): Promise<{ user: IUserDto, chef: IChef; }> {
        const { name, email, phone, location, specialities, bio, image, certificates, achievements, skills } = data;
        console.log('=================', bio);

        const updateUser = await this._userRepository.findByIdAndUpdate(userId, { name, email })
        const updateChef = await this._chefRepository.updateProfile(userId, { phone, location, specialities, bio, image, certificates, achievements, skills });
        console.log('result updae=====', updateChef, 'user==', updateUser);
        console.log('reeeeeeeeeeech');

        if (!updateChef) throw new AppError('failed to chef update profile data', STATUS_CODE.INTERNAL_SERVER_ERROR)
        if (!updateUser) throw new AppError('failed to user update profile data', STATUS_CODE.INTERNAL_SERVER_ERROR)
        return { user: userMapper(updateUser), chef: chefMapper(updateChef as IChefDocument) }
    }
    async getProfile(chefId: string): Promise<{ data: IChef | boolean; reviews?: IReviewDocument[] }> {
        console.log("chefId", chefId);

        const result = await this._chefRepository.findByChefId(chefId);

        let reviews: IReviewDocument[] = [];
        if (result) {
            reviews = await this._reviewRepository.findReview(result._id as string, "Chef");
        }

        return { data: result ? chefMapper(result as IChefDocument) : false, reviews }
    }
    async getUser(id: string): Promise<{ data: IUserDto; }> {
        console.log('userid', id);

        const user = await this._userRepository.findOne({ _id: id })
        if (!user) throw new AppError('user not found', STATUS_CODE.NOT_FOUND)
        return { data: userMapper(user) }
    }

    async getAllChefs(page: number, limit: number, search: string, filter?: string): Promise<{ datas: IChef[]; totalCount: number }> {
        const skip = (page - 1) * limit;
        const result = await this._chefRepository.findAllChefs(skip, limit, search, filter);
        return { datas: chefsMapper(result.datas), totalCount: result.totalCount };
    }

    async getChefDetails(chefId: string): Promise<{ data: IChef }> {
        const result = await this._chefRepository.findDetailsByChefId(chefId);
        if (!result) throw new AppError('Chef not found', STATUS_CODE.NOT_FOUND);
        return { data: chefMapper(result as IChefDocument) };
    }

    async getDashboardStats(chefId: string): Promise<{ totalRecipes: number; averageRating: number; totalFollowers: number; totalWorkshops: number }> {
        const totalRecipes = await RecipeModel.countDocuments({ chefId });

        const totalWorkshops = await WorkshopModel.countDocuments({ chefId });

        const totalFollowers = await FollowModel.countDocuments({ followingId: chefId });

        const chefProfile = await this._chefRepository.findByChefId(chefId);
        let averageRating = 0;

        if (chefProfile) {
            const reviews = await this._reviewRepository.findReview(chefId, "Chef");
            if (reviews && reviews.length > 0) {
                const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
                averageRating = parseFloat((totalRating / reviews.length).toFixed(1));
            }
        }

        return {
            totalRecipes,
            averageRating,
            totalFollowers,
            totalWorkshops
        };
    }
}