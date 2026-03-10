import { Types } from "mongoose";

export interface IChef {
    chefId: string | Types.ObjectId;
    phone?: string;
    location: string;
    specialities: string[];
    bio?: string;
    image?: string;
    status: "active" | "blocked";
    isVerified: boolean;
    certificates?: string[];
    achievements?: string[];
    skills?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}
