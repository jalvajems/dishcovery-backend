import { Document } from "mongoose";
import { IFoodieDto } from "../../dtos/foodie.dtos";
import { IFoodie } from "../../types/foodie.types";
import { email } from "zod";

export default function foodieMapper(foodie: IFoodie & Document): IFoodieDto {
    const obj = foodie.toObject()
    return {
        userId:{
            id: obj.userId?._id,
            name: obj.userId?.name,
            email: obj.userId?.email
        },
        phone: obj.phone,
        location:obj.location,
        preferences:obj.preferences,
        bio:obj.bio,
        image:obj.image,
        status: obj.status
    }
}