import { IUserRepository } from "../interface/IUserRepository";
import { IUser } from "../../types/user.types";
import { IUserDocument, User } from "../../models/users.model";

export class UserRepository implements IUserRepository{
    async createUser(userData: IUser):Promise<IUserDocument>{
        return new User (userData).save();
    }
    async findByEmail(email: string): Promise<IUserDocument| null> {
    return User.findOne({ email });
  }

  
}