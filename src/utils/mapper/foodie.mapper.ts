import { Document } from "mongoose";
import { IFoodieDto } from "../../dtos/foodie.dtos";
import { IFoodie } from "../../types/foodie.types";

export default function foodieMapper(foodie: IFoodie & Document): IFoodieDto {
    const obj = foodie.toObject()
    return {
        userId: obj.userId.toString(),
        phone: obj.phone,
        location:obj.location,
        preferences:obj.preferences,
        bio:obj.bio,
        image:obj.image,
        status: obj.status
    }
}