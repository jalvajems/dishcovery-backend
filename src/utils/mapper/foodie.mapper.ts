import { Document, Types } from "mongoose";
import { IFoodieDto } from "../../dtos/foodie.dtos";
import { IFoodie } from "../../types/foodie.types";
import { IUser } from "../../types/user.types";

export default function foodieMapper(foodie: IFoodie & Document): IFoodieDto {
    const obj = foodie.toObject();
    const user = obj.userId;

    if (user && typeof user === 'object' && !('_id' in user)) {
        // It's likely an ObjectId or just ID string if not populated, but here we check for populated check
        // Actually, if it is populated, it should have _id. 
        // If it is ObjectId, it has _id too in some versions but usually treated as object.
        // Let's use simpler logic: check if we can access name/email
    }

    const isPopulated = user && typeof user === 'object' && 'email' in user;

    return {
        _id: obj._id,
        userId: isPopulated ? {
            _id: (user as unknown as IUser & { _id: Types.ObjectId })._id.toString(),
            name: (user as unknown as IUser).name,
            email: (user as unknown as IUser).email,
            role: (user as unknown as IUser).role,
            isBlocked: (user as unknown as IUser).isBlocked
        } : user?.toString(),
        phone: obj.phone,
        location: obj.location,
        preferences: obj.preferences,
        bio: obj.bio,
        image: obj.image,
        status: obj.status
    };
}