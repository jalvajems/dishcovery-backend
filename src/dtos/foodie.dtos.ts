import { Types } from "mongoose";

export interface IFoodieDto {
    _id: string | Types.ObjectId;
    userId: {
        _id: string;
        name: string;
        email: string;
        role: string;
        isBlocked: boolean;
    } | string | Types.ObjectId;
    phone: string;
    location: string;
    preferences: string[];
    bio: string;
    image: string;
    status: string;
}

export interface IFoodieProfileDto {
    userId?: string;
    name?: string;
    phone?: string;
    location?: string;
    preferences?: string[];
    bio?: string;
    image?: string;
}