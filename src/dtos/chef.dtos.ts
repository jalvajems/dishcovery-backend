import { IChef } from "../types/chef.types";
import { IUser } from "../types/user.types";
import { IReviewDocument } from "../models/review.model";

export interface IChefProfileDto {
    phone?: string;
    location?: string;
    specialities?: string[];
    bio?: string;
    image?: string;
    certificates?: string[];
    achievements?: string[];
    skills?: string[];
    name?: string;
    email?: string;
}

export interface IUpdateChefProfileResponse {
    user: IUser;
    chef: IChef;
}

export interface IGetChefProfileResponse {
    data: IChef | boolean;
    reviews?: IReviewDocument[];
}

export interface IGetAllChefsResponse {
    datas: IChef[]; // or IChefDocument[] depending on what repo returns, repo returns IChefDocument[] which extends IChef
    totalCount: number;
}
