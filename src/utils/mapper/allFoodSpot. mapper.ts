import { Document } from "mongoose";
import { IFoodSpot } from "../../types/foodSpot.types";
import { IFoodSpotResDto } from "../../dtos/foodSpot.dtos";
import { foodSpotResponseMapper } from "./foodSpot.mapper";

export function allFoodSpotsMapper(foodSpots: any[]): IFoodSpotResDto[] {
    return foodSpots.map(spot=>foodSpotResponseMapper(spot)) 

}