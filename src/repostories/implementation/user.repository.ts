import { IUserRepository } from "../interface/IUserRepository";
import { IUserDocument, UserModel } from "../../models/users.model";
import { BaseRepository } from "./base.repository";
import { Document } from "mongoose";
import { IUser } from "../../types/user.types";

export class UserRepository extends BaseRepository<IUserDocument> implements IUserRepository{

  constructor(){
    super(UserModel)
  }

  async findByEmail(email: string): Promise<IUserDocument| null> {    
    return UserModel.findOne({ email });
  }
  async findById(id: string|null): Promise<IUserDocument | null> {
      return UserModel.findOne({_id:id})
  }
  async updatePasswordByEmail(email: string, hashedPass: string): Promise<void> {
    await UserModel.updateOne({email},{$set:{password:hashedPass}})
  }
  async findByRole(filter: object, skip: number, limit: number): Promise<IUserDocument[]> {
    return UserModel.find(filter).skip(skip).limit(limit);
  }
  async countDocuments(filter: object): Promise<number> {
    return UserModel.countDocuments(filter)
  }
  async blockById(id: string): Promise<IUser & Document|null> {
    return await UserModel.findByIdAndUpdate({ _id: id },{ $set: { isBlocked: true } },{ new: true });
  }
  async unblockById(id: string): Promise<IUser&Document|null> {
    return await UserModel.findByIdAndUpdate({ _id: id },{ $set: { isBlocked: false } },{ new: true });
  }
  async verifyById(id: string): Promise<(IUser & Document) | null> {
    return await UserModel.findByIdAndUpdate({_id:id},{$set:{isVerified:true}},{new:true})
  }
  async unVerifyById(id: string): Promise<(IUser & Document) |null> {
    return await UserModel.findByIdAndUpdate({_id:id},{$set:{isVerified:false}},{new:true})
  }
  async findByIdAndUpdate(userId: string, data: object): Promise<IUserDocument | null> {
    return await UserModel.findByIdAndUpdate(userId,data,{new:true,runValidators:true})
  }

  
}