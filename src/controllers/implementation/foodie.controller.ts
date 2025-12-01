import { Request, Response, NextFunction } from "express";
import { IFoodieDto } from "../../dtos/foodie.dtos";
import { IFoodieController } from "../interface/IFoodieController";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IFoodieService } from "../../services/interface/IFoodieService";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { success } from "zod";

@injectable()
export class FoodieController implements IFoodieController {
    
    constructor(
        @inject(TYPES.IFoodieService) private _foodieService: IFoodieService,
    ) { }
    
    async getFoodieDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('reached dashboard');
            
            res.status(STATUS_CODE.SUCCESS).json({ message: 'Entered into foodie dashboard!!' })
        } catch (error) {
            next(error);
        }
    }
    
    async getAllRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log('reached controller');
        console.log('reached fr cntrlr');
        try {
            const result=await this._foodieService.getAllRecipes();
            res.status(STATUS_CODE.SUCCESS).json({success:true,recipeData:result.data,message:result.message})
        } catch (error) {
            throw error;
        }
    }//remove this========================^
    async getRecipeDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
                        console.log('reached');

            const id=req.params.id;
            if(!id)throw new AppError('recipe id is not found!',STATUS_CODE.NOT_FOUND);
            const result=await this._foodieService.getRecipeDetail(id);
            res.status(STATUS_CODE.SUCCESS).json({success:true,data:result.data,message:result.message})

        } catch (error) {
            throw error;
        }
    }

    async createProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId=req.user?.id
            const data=req.body;
            if(!userId)throw new AppError("user not authorized",STATUS_CODE.UNAUTHORIZED)
                const result=await this._foodieService.createProfile(userId,data)
            res.status(STATUS_CODE.SUCCESS).json({success:true,data:result,message:"profile created"})
        } catch (error) {
            next(error)
        }
    }
    async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
        if(!userId)throw new AppError("user not authorized",STATUS_CODE.UNAUTHORIZED)
            const result = await this._foodieService.updateProfile(userId, req.body);
        res.status(STATUS_CODE.SUCCESS).json({success:true,data:result,message:"profile updated"})
    } catch (error) {
        next(error);
    }
}
async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId=req.user?.id
        if(!userId)throw new AppError("user not authorized",STATUS_CODE.UNAUTHORIZED)
        const result=await this._foodieService.getProfile(userId)
        res.status(STATUS_CODE.SUCCESS).json({success:true,data:result,message:"fetched profile successfully"})
        } catch (error) {
         next(error)   
        }
    }
}