import { Types } from "mongoose";

export interface IFollow {
    followerId: string | Types.ObjectId;  
    followingId: string | Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
