import  {model, Schema,Document} from "mongoose";
import { IUser, Role } from "../types/user.types";

export interface IUserDocument extends IUser, Document{}

const userSchema= new Schema<IUserDocument>(
    {
        name:{type:String, required:true, trim:true},
        email:{type:String, required:true, unique:true, lowercase:true},
        password:{type:String, required:true},
        role:{type:String,enum: Object.values(Role), default:Role.USER},
        isVarified:{type:Boolean, default:false},
    },
    {timestamps:true}
);

export const User= model<IUserDocument>('User',userSchema);