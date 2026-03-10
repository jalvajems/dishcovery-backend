import { Types } from "mongoose";

export interface IFoodie {
    userId: Types.ObjectId | string;
    phone: string;
    location: string;
    preferences: string[];
    bio: string;
    image: string;
    status: string;
}