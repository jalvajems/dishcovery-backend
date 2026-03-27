import { Types } from "mongoose";

export interface IFoodie {
    userId: Types.ObjectId | string;
    phone: string;
    location: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
    };
    address: string;
    preferences: {
        recipeCategory: string[];
        blogTags: string[];
    };
    bio: string;
    image: string;
    status: string;
}