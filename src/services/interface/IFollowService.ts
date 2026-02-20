import { IFollowDocument } from "../../models/follow.model";
import { IFollower, IFollowing } from "../../types/follow.types";
import { IFoodieDto } from "../../dtos/foodie.dtos";

export interface IFollowService {
    follow(followerId: string, followingId: string): Promise<IFollowDocument>;
    unfollow(followerId: string, followingId: string): Promise<boolean>;
    isFollowing(followerId: string, followingId: string): Promise<boolean>;
    getFollowers(followingId: string, page: number, limit: number): Promise<{ followers: IFollower[], total: number }>;
    getFollowing(followerId: string, page: number, limit: number, search?: string): Promise<{ following: IFollowing[], total: number }>;
    getFollowStats(userId: string): Promise<{ followers: number, following: number }>;
    getFoodieProfile(userId: string): Promise<{ data: IFoodieDto | boolean }>;
}
