import mongoose, { Document, FilterQuery, Model, Types, UpdateQuery } from "mongoose";
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
    async findById(id: string | mongoose.Types.ObjectId): Promise<T | null> {
    return await this.model.findById(id);
      
  }
  async findOne(filter: FilterQuery<T> = {}): Promise<T | null> {
    return await this.model.findOne(filter);
  }

  async  updateById(id: string | mongoose.Types.ObjectId, update: UpdateQuery<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, update, { new: true });
  }
  async deleteById(id: string | mongoose.Types.ObjectId): Promise<void|null> {
    return await this.model.findByIdAndDelete(id)
  }
  async deleteByFilter(filter: mongoose.FilterQuery<T>): Promise<mongoose.DeleteResult> {
      return await this.model.deleteOne(filter)
  }
  async countDocument(filter: object): Promise<number> {
    return await this.model.countDocuments(filter);
  }


}