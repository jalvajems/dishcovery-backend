import { IUserDocument } from "../../models/users.model";
import { IUser } from "../../types/user.types";

export interface IAuthService{
    registerUser(userData:IUser):Promise<IUserDocument>; 
    loginUser(email:string, password:string):Promise<IUserDocument|null>; 
}