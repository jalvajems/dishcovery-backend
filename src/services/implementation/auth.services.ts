import bcrypt from 'bcryptjs';
import { IAuthService } from '../interface/IAuthService';
import { IUserDocument } from '../../models/users.model';
import { IUser } from '../../types/user.types';
import { AppError } from '../../utils/AppError';
import { inject, injectable } from 'inversify';
import { IUserRepository } from '../../repostories/interface/IUserRepository';
import TYPES from '../../DI/types';

@injectable()
export class AuthService implements IAuthService{
    constructor(@inject(TYPES.IUserRepository)private userRepository:IUserRepository){}


    async registerUser(userData: IUser): Promise<IUserDocument> {
        const existingUser=await this.userRepository.findByEmail(userData.email);
        if(existingUser)throw new AppError('Email already Registered',400);

        const hashPassword=await bcrypt.hash(userData.password,10)

        return await this.userRepository.createUser({
            ...userData,
            password:hashPassword,
        });
    }
    async loginUser(email: string, password: string): Promise<IUserDocument | null> {
        const user=await this.userRepository.findByEmail(email)
        if(!user)throw new AppError('Invalid email or password',401);

        return user;

    }
    async userListing(email:string):Promise<IUserDocument>{
        const users=await this.userRepository.findByEmail(email)
        if(!users)throw new AppError('no users ', 404);
        return users;
    }
}