import { UserDataDto } from "./userData.dto";

export interface IFoodSpotResDto {
  _id: string;
  name: string;
  description?: string;
  coverImage: string;

  location: {
    type: "Point";
    coordinates: [number, number];
  };

  address?: {
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
  openingHours: {
      open: String,  
      close: String, 
      isOpenNow: Boolean,
    },

  rating?: number;
  likesCount: number;
  savesCount: number;

  foodieId: UserDataDto;
   isApproved?: boolean;
    isBlocked?: boolean;

  createdAt: Date;
  updatedAt: Date;
}
