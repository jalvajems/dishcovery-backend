import { Document, FilterQuery, Model } from "mongoose";
import { IBaseRepository } from "../interface/IBaseRepository";


export class BaseRepository <T extends Document> implements IBaseRepository<T>{

    protected model : Model<T>;

    constructor (model:Model<T>){
        this.model=model;
    }
    
    async create(data: Partial<T>): Promise<T> {
        return await this.model.create(data)
    }
    async findAll(filter: FilterQuery<T>): Promise<T[]> {
        return this.model.find(filter)
    }

}