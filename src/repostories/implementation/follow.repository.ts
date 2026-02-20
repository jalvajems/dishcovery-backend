import mongoose, { PipelineStage } from "mongoose";
import { FollowModel, IFollowDocument } from "../../models/follow.model";
import { IFollowRepository } from "../interface/IFollowRepository";
import { IFollower, IFollowing } from "../../types/follow.types";
import { BaseRepository } from "./base.repository";
import { injectable } from "inversify";

@injectable()
export class FollowRepository extends BaseRepository<IFollowDocument> implements IFollowRepository {
    constructor() {
        super(FollowModel);
    }

    async follow(followerId: string, followingId: string): Promise<IFollowDocument> {
        return await FollowModel.create({ followerId, followingId });
    }

    async unfollow(followerId: string, followingId: string): Promise<boolean> {
        const result = await FollowModel.findOneAndDelete({ followerId, followingId });
        return !!result;
    }

    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        const count = await FollowModel.countDocuments({ followerId, followingId });
        return count > 0;
    }

    async getFollowers(followingId: string, page: number, limit: number): Promise<{ followers: IFollower[], total: number }> {
        const skip = (page - 1) * limit;
        const followers = await FollowModel.aggregate([
            { $match: { followingId: new mongoose.Types.ObjectId(followingId) } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users',
                    localField: 'followerId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $lookup: {
                    from: 'foodies',
                    localField: 'followerId',
                    foreignField: 'userId',
                    as: 'foodie'
                }
            },
            {
                $project: {
                    _id: 1,
                    followerId: {
                        _id: '$user._id',
                        name: '$user.name',
                        email: '$user.email',
                        image: { $arrayElemAt: ['$foodie.image', 0] },
                        location: { $arrayElemAt: ['$foodie.location', 0] }
                    },
                    createdAt: 1
                }
            }
        ]);

        const total = await FollowModel.countDocuments({ followingId });
        return { followers, total };
    }

    async getFollowing(followerId: string, page: number, limit: number, search?: string): Promise<{ following: IFollowing[], total: number }> {
        const skip = (page - 1) * limit;

        const pipeline: PipelineStage[] = [
            { $match: { followerId: new mongoose.Types.ObjectId(followerId) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'followingId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $lookup: {
                    from: 'chefs',
                    localField: 'followingId',
                    foreignField: 'chefId',
                    as: 'chef'
                }
            },
            { $unwind: { path: '$chef', preserveNullAndEmptyArrays: true } }
        ];

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            pipeline.push({
                $match: {
                    $or: [
                        { 'user.name': searchRegex },
                        { 'chef.specialities': { $in: [searchRegex] } },
                        { 'chef.bio': searchRegex }
                    ]
                }
            });
        }

        pipeline.push(
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                followingId: {
                                    _id: '$user._id',
                                    name: '$user.name',
                                    email: '$user.email',
                                    image: '$chef.image',
                                    location: '$chef.location',
                                    specialities: '$chef.specialities'
                                },
                                createdAt: 1
                            }
                        }
                    ]
                }
            }
        );

        const result = await FollowModel.aggregate(pipeline);
        const following = result[0].data;
        const total = result[0].metadata[0]?.total || 0;

        return { following, total };
    }

    async countFollowers(followingId: string): Promise<number> {
        return await FollowModel.countDocuments({ followingId });
    }

    async countFollowing(followerId: string): Promise<number> {
        return await FollowModel.countDocuments({ followerId });
    }
}
