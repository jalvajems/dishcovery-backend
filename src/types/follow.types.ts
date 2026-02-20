import { Types } from "mongoose";

export interface IFollow {
    followerId: string | Types.ObjectId;
    followingId: string | Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IFollower {
    _id: string;
    followerId: {
        _id: string;
        name: string;
        email: string;
        image: string;
        location?: string;
    };
    createdAt: Date;
}

export interface IFollowing {
    _id: string;
    followingId: {
        _id: string;
        name: string;
        email: string;
        image: string;
        location?: string;
        specialities?: string[];
    };
    createdAt: Date;
}
