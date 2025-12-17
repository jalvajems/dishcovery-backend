import { IUserDto } from "../../dtos/user.dtos";
import { IChef } from "../../types/chef.types";
import { IUser } from "../../types/user.types";

export interface IChefService {
    createProfile(chefId:string,data:object):Promise<{data:IChef}>;
    updateProfile(chefId:string,data:object):Promise<{user:IUser,chef:IChef}>;
    getProfile(chefId:string):Promise<{data:IChef|boolean}>;
    getUser(id:string):Promise<{data:IUserDto}>
}