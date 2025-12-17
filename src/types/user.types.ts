import {Types} from 'mongoose'

export enum Role{
    USER='user',
    CHEF='chef',
    ADMIN='admin'
}
export interface IUser{
    name: string;
    email: string;
    password: string;
    role: Role;
    isVerified: boolean;
    isBlocked:boolean;
    savedRecipes: (string | Types.ObjectId)[];
    savedBlogs:  (string | Types.ObjectId)[];
    createdAt?: Date;
    updatedAt?: Date;
}