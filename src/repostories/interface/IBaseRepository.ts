import mongoose, { Document, FilterQuery, UpdateQuery } from "mongoose";

export interface IBaseRepository<T extends Document> {
    create(data: Partial<T>): Promise<T>;
    findAll(filter: FilterQuery<T>): Promise<T[]>;
    findById(id: string | mongoose.Types.ObjectId): Promise<T | null>;
    findOne(filter: FilterQuery<T>): Promise<T | null>;
    updateById(id: string | mongoose.Types.ObjectId, update: UpdateQuery<T>): Promise<T | null>;
    deleteById(id: string | mongoose.Types.ObjectId): Promise<void|null>;
    deleteByFilter(filter: FilterQuery<T>): Promise<mongoose.DeleteResult>;
    countDocument(filter:object):Promise<number>;

}