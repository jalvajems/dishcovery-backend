import { IUserRepository } from "../interface/IUserRepository";
import { IUserDocument, UserModel } from "../../models/users.model";
import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<IUserDocument> implements IUserRepository{

  constructor(){
    super(UserModel)
  }

  async findByEmail(email: string): Promise<IUserDocument| null> {
    return UserModel.findOne({ email });
  }

  
}