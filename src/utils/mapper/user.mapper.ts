import { IUser } from "../../types/user.types";
import {UserDto} from "../../dtos/user.dtos";
import { Document } from "mongoose";

export function userMapper(user:IUser & Document):UserDto{
    const obj=user.toObject()
    return {
        _id: obj._id.toString(),
        name: obj.name,
        email: obj.email,
        role: obj.role,
        isVarified: obj.isVarified,
        createdAt: obj.createdAt,

    }
}