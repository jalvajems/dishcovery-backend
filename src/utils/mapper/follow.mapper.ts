import { IFollowDto } from "../../dtos/follow.dtos";
import { IFollowDocument } from "../../models/follow.model";

export function followMapper(follow: IFollowDocument): IFollowDto {
    const obj = follow.toObject ? follow.toObject() : follow;
    return {
        id: (obj._id || obj.id).toString(),
        followerId: obj.followerId.toString(),
        followingId: obj.followingId.toString(),
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    };
}
