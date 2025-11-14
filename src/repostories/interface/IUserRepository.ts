import { IUserDocument } from "../../models/users.model";
import { IBaseRepository } from "./IBaseRepository";

export  interface IUserRepository extends IBaseRepository<IUserDocument>{
    findByEmail(email:string): Promise<IUserDocument | null>;
    updatePasswordByEmail(email:string,hashedPass:string):Promise<void>;
}