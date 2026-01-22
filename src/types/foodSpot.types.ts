import { Types } from "mongoose";

export interface IFoodSpot {
foodieId: object;
    name: string;
    description: string;
    coverImage: string;
    location: {
        type: "Point";
        coordinates: [number, number];
    };
    address: {
        placeName?: string;
        city?: string;
        state?: string;
        country?: string;
        fullAddress?: string;
    };
    exploredFoods: {
        name: string;
        price?: number;
        image?: string;
    }[];
    speciality: string[];
    tags: string[];
    rating?: number;
    openingHours: {
      open: String, 
      close: String, 
      isOpenNow: Boolean,
    },
    likesCount: number;
    savesCount: number;
    isApproved?: boolean;
    isBlocked?: boolean;
}