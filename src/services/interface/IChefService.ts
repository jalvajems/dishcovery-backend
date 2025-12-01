import { IChef } from "../../types/chef.types";
import { IUser } from "../../types/user.types";

export interface IChefService {
    createProfile(chefId:string,data:object):Promise<{data:IChef}>;
    updateProfile(chefId:string,data:object):Promise<{user:IUser,chef:IChef}>;
    getProfile(userId:string):Promise<{data:IChef|null}>;
}