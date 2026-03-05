import { inject, injectable } from "inversify";
import { IFollowDocument } from "../../models/follow.model";
import { IFollowRepository } from "../../repostories/interface/IFollowRepository";
import { IFollowService } from "../interface/IFollowService";
import TYPES from "../../DI/types";
import { IFoodieService } from "../interface/IFoodieService";
import { IChefRepository } from "../../repostories/interface/IChefRepository";
import { IFollower, IFollowing } from "../../types/follow.types";
import { IFoodieDto } from "../../dtos/foodie.dtos";
import { followMapper } from "../../utils/mapper/follow.mapper";
import { IFollowDto } from "../../dtos/follow.dtos";

@injectable()
export class FollowService implements IFollowService {
    constructor(
        @inject(TYPES.IFollowRepository) private _followRepository: IFollowRepository,
        @inject(TYPES.IFoodieService) private _foodieService: IFoodieService,
        @inject(TYPES.IChefRepository) private _chefRepository: IChefRepository,
    ) { }

    async follow(followerId: string, followingId: string): Promise<IFollowDto> {
        const result = await this._followRepository.follow(followerId, followingId);
        return followMapper(result);
    }

    async unfollow(followerId: string, followingId: string): Promise<boolean> {
        return await this._followRepository.unfollow(followerId, followingId);
    }

    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        return await this._followRepository.isFollowing(followerId, followingId);
    }

    async getFollowers(followingId: string, page: number, limit: number): Promise<{ followers: IFollower[], total: number }> {
        return await this._followRepository.getFollowers(followingId, page, limit);
    }

    async getFollowing(followerId: string, page: number, limit: number, search?: string): Promise<{ following: IFollowing[], total: number }> {
        return await this._followRepository.getFollowing(followerId, page, limit, search);
    }

    async getFollowStats(userId: string): Promise<{ followers: number, following: number }> {
        const [followers, following] = await Promise.all([
            this._followRepository.countFollowers(userId),
            this._followRepository.countFollowing(userId)
        ]);
        return { followers, following };
    }

    async getFoodieProfile(userId: string): Promise<{ data: IFoodieDto | boolean }> {
        return await this._foodieService.getProfile(userId);
    }
}
