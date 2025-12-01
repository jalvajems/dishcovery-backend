import { Request, Response, NextFunction } from "express";
import { IChefController } from "../interface/IChefController";
import { STATUS_CODE } from "../../constants/StatusCode";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IChefService } from "../../services/interface/IChefService";
import { success } from "zod";
import { AppError } from "../../utils/AppError";

@injectable()
export class ChefController implements IChefController{

    constructor(
        @inject(TYPES.IChefService) private _chefService:IChefService,
    ){}

    async getChefDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        res.status(STATUS_CODE.SUCCESS).json({message:'entered in to chef dashboard'})
    }
    async createProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId=req.user?.id;
            const payload=req.body;
            
            console.log('data===',payload);
            
            
            if(!chefId)throw new AppError('no chef id  found',STATUS_CODE.UNAUTHORIZED)
            const result=await this._chefService.createProfile(chefId,payload)
            res.status(STATUS_CODE.SUCCESS).json({success:true,datas:result.data,message:'Profile created successfully'})
        } catch (error) {
            next(error)
        }
    }
    async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId=req.user?.id;
            const data=req.body;
            if(!chefId)throw new AppError("not authenticated",STATUS_CODE.UNAUTHORIZED)
                const result= await this._chefService.updateProfile(chefId as string,data)
            res.status(STATUS_CODE.SUCCESS).json({success:true,datas:result,message:"Profie data updated!!"})
        } catch (error) {
            next(error)
            
        }
    }
    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId=req.user?.id
            console.log('userid',userId);
            
            if(!userId)throw new AppError("user is not authorized",STATUS_CODE.UNAUTHORIZED)
                const result=await this._chefService.getProfile(userId);
            res.status(STATUS_CODE.SUCCESS).json({success:true,datas:result.data,message:"data fetched successfullu"})
        } catch (error) {
            next(error)
        }
    }

}