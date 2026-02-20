import { IFollowDocument } from "../../models/follow.model";
import { IBaseRepository } from "./IBaseRepository";

import { IFollower, IFollowing } from "../../types/follow.types";

export interface IFollowRepository extends IBaseRepository<IFollowDocument> {
    follow(followerId: string, followingId: string): Promise<IFollowDocument>;
    unfollow(followerId: string, followingId: string): Promise<boolean>;
    isFollowing(followerId: string, followingId: string): Promise<boolean>;
    getFollowers(followingId: string, page: number, limit: number): Promise<{ followers: IFollower[], total: number }>;
    getFollowing(followerId: string, page: number, limit: number, search?: string): Promise<{ following: IFollowing[], total: number }>;
    countFollowers(followingId: string): Promise<number>;
    countFollowing(followerId: string): Promise<number>;
}
