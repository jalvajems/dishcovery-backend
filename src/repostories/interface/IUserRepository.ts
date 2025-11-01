import { IUserDocument } from "../../models/users.model";
import { IUser } from "../../types/user.types";

export  interface IUserRepository{
    createUser(userData: IUser): Promise<IUserDocument>;
    findByEmail(email:string): Promise<IUserDocument | null>;
}