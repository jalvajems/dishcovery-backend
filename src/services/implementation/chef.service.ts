import { inject, injectable } from "inversify";
import { IChefService } from "../interface/IChefService";
import TYPES from "../../DI/types";
import { IChefRepository } from "../../repostories/interface/IChefRepository";
import { IChef } from "../../types/chef.types";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { object } from "zod";
import { IUserRepository } from "../../repostories/interface/IUserRepository";
import { IUser } from "../../types/user.types";

@injectable()
export class ChefService implements IChefService{
    constructor(
        @inject(TYPES.IChefRepository)private _chefRepository:IChefRepository,
        @inject(TYPES.IUserRepository)private _userRepository:IUserRepository
    ){}
    async createProfile( chefId:string,data: object): Promise<{ data: IChef; }> {
        try {
            const existing= await this._chefRepository.findByChefId(chefId);
            if(existing){
                throw new AppError("Profile already exist!",STATUS_CODE.INTERNAL_SERVER_ERROR)
            }

            const result= await this._chefRepository.createProfile({chefId,...data});
            if(!result)throw new AppError('profile creation failed',STATUS_CODE.INTERNAL_SERVER_ERROR)

            return {data:result}
        } catch (error) {
            throw error;
        }
    }
    async updateProfile(userId: string, data: object): Promise<{ user:IUser,chef:IChef; }> {
        try {
            const {name,email,phone,location,specialities,bio,image}:any=data
            const updateUser=await this._userRepository.findByIdAndUpdate(userId,{name,email})
            const updateChef = await this._chefRepository.updateProfile(userId,{phone,location,specialities,bio,image});
            console.log('result updae=====',updateChef ,'user==',updateUser);
            
            if(!updateChef)throw new AppError('failed to chef update profile data',STATUS_CODE.INTERNAL_SERVER_ERROR)
            if(!updateUser)throw new AppError('failed to user update profile data',STATUS_CODE.INTERNAL_SERVER_ERROR)
            return {user:updateUser,chef:updateChef}
        } catch (error) {
            throw error;
        }
    }
    async getProfile(chefId: string): Promise<{ data: IChef|null; }> {
        try {
            
            const result=await this._chefRepository.findByChefId(chefId);
            console.log('result',result);
            
            // if(!result)throw new AppError('No profile found',STATUS_CODE.NOT_FOUND)
            return {data:result||null}
        } catch (error) {
            throw error;
        }
    }
}