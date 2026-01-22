import { IFollowDocument } from "../../models/follow.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IFollowRepository extends IBaseRepository<IFollowDocument> {
    follow(followerId: string, followingId: string): Promise<IFollowDocument>;
    unfollow(followerId: string, followingId: string): Promise<boolean>;
    isFollowing(followerId: string, followingId: string): Promise<boolean>;
    getFollowers(followingId: string, page: number, limit: number): Promise<{ followers: any[], total: number }>;
    getFollowing(followerId: string, page: number, limit: number, search?: string): Promise<{ following: any[], total: number }>;
    countFollowers(followingId: string): Promise<number>;
    countFollowing(followerId: string): Promise<number>;
}
