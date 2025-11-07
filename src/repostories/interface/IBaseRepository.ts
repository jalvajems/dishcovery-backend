import mongoose, { Document, FilterQuery } from "mongoose";

export interface IBaseRepository <T extends Document>{
    create(data:Partial<T>):Promise<T>;
    findAll(filter: FilterQuery <T>):Promise<T[]>;
    // findById(id:string|mongoose.Types.ObjectId):Promise<T>;
}