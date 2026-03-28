import { IFoodSpotResDto } from "../../dtos/foodSpot.dtos";
import { IFoodSpotDocument } from "../../models/foodSpot.model";
import { foodSpotResponseMapper } from "./foodSpot.mapper";

export function allFoodSpotsMapper(foodSpots: IFoodSpotDocument[]): IFoodSpotResDto[] {
    return foodSpots.map(spot=>foodSpotResponseMapper(spot)) 

}