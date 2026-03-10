import { Document, Types } from "mongoose";
import { IChef } from "../../types/chef.types";
import { IUser } from "../../types/user.types";

export function chefMapper(chef: IChef & Document): IChef {
    const obj = chef.toObject();
    const user = obj.chefId;

    const isPopulated = user && typeof user === 'object' && 'email' in user;

    return {
        chefId: isPopulated ? {
            _id: (user as unknown as IUser & { _id: Types.ObjectId })._id.toString(),
            name: (user as unknown as IUser).name,
            email: (user as unknown as IUser).email,
            role: (user as unknown as IUser).role,
            isBlocked: (user as unknown as IUser).isBlocked
        } : user?.toString(),
        phone: obj.phone,
        location: obj.location,
        specialities: obj.specialities,
        bio: obj.bio,
        image: obj.image,
        status: obj.status,
        isVerified: obj.isVerified,
        certificates: obj.certificates,
        achievements: obj.achievements,
        skills: obj.skills,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    } as IChef;
}
