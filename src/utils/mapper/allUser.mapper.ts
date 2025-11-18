import { Document } from "mongoose";
import { IUser } from "../../types/user.types";
import { IUserDto } from "../../dtos/user.dtos";
import { userMapper } from "./user.mapper";

export function usersMapper(users: (IUser & Document)[]): IUserDto[] {
    return users.map(user => userMapper(user));
}
