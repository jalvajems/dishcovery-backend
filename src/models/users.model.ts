import mongoose, {Schema,Document} from "mongoose";
import { IUser } from "../types/user.types";

export interface IUserDocument extends IUser, Document{}

const userSchema= new Schema<IUserDocument>(
    {
        name:{type:String, required:true, trim:true},
        email:{type:String, required:true, unique:true, lowercase:true},
        password:{type:String, required:true},
        role:{type:String, enum:['admin','chef','foodie'], default:"foodie"},
        isVarified:{type:Boolean, default:false},
    },
    {timestamps:true}
);

export const UserModel= mongoose.model<IUserDocument>('User',userSchema);