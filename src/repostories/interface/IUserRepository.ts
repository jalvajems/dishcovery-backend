import { Document } from "mongoose";
import { IUserDocument } from "../../models/users.model";
import { IUser } from "../../types/user.types";
import { IBaseRepository } from "./IBaseRepository";

export  interface IUserRepository extends IBaseRepository<IUserDocument>{
    findByEmail(email:string): Promise<IUserDocument | null>;
    findByIdAndUpdate(userId:string,data:object):Promise<IUserDocument|null>
    findById(id:string|null):Promise<IUserDocument|null>;
    updatePasswordByEmail(email:string,hashedPass:string):Promise<void>;
    findByRole(filter:object,skip:number,limit:number):Promise<IUserDocument[]>;
    countDocuments(filter:object):Promise<number>;
    blockById(id:string):Promise<IUser&Document|null>;
    unblockById(id:string):Promise<IUser&Document|null>;
    verifyById(id:string):Promise<IUser&Document|null>;
    unVerifyById(id:string):Promise<IUser&Document|null>;
}