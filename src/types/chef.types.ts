import { Types } from "mongoose";

export interface IChef{
 chefId: string | Types.ObjectId;
    phone: string;
    location: string;
    specialities:string[]
    preferences: string;
    bio: string;
    image: string;
    status: string;
}