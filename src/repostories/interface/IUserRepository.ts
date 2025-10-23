import { IUser } from "../../types/user.types";
import { IUserDocument } from "../../models/users.model";

export  interface IUserRepository{
    createUser(data: IUser): Promise<IUserDocument>;
    findByEmail(email:string): Promise<IUserDocument | null>
}