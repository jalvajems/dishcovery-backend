import { inject, injectable } from "inversify";
import { IRecipeController } from "../interface/IRecipeController";
import TYPES from "../../DI/types";
import { IRecipeService } from "../../services/interface/IRecipeService";
import { Request, Response, NextFunction } from "express";
import { log } from "../../utils/logger";
import { STATUS_CODE } from "../../constants/StatusCode";
import { success } from "zod";
import { AppError } from "../../utils/AppError";

@injectable()
export class RecipeController implements IRecipeController{

    constructor(
        @inject(TYPES.IRecipeService) private _recipeService: IRecipeService,
    ){}
    async addRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const recipeData=req.body;
            log.info('recipedata got on controller ==>',recipeData);
            const result=await this._recipeService.createRecipe(recipeData);
            res.status(STATUS_CODE.SUCCESS).json({success:true, message:result.message})
        } catch (error) {
            throw error   
        }
    }
    async editRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {id,newData}=req.body
            const result=await this._recipeService.editRecipe(id,newData)
            res.status(STATUS_CODE.SUCCESS).json({success:true,data:result.data,message:result.message})
        } catch (error) {
            throw error;
        }
    }
    async getAllRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id=req.query.chefId;
            if(!id)throw new AppError('user id is not found',STATUS_CODE.NOT_FOUND)
            const result=await this._recipeService.getAllRecipes(String(id));
            res.status(STATUS_CODE.SUCCESS).json({success:true,data:result.data,message:result.message})
        } catch (error) {
            throw error
        }
    }
    async getRecipeDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id=req.params.id
            if(!id)throw new AppError('id is missing',STATUS_CODE.NOT_FOUND)
                const result=await this._recipeService.getRecipeDetail(id)
            res.status(STATUS_CODE.SUCCESS).json({success:true,data:result.data,message:result.message})
        } catch (error) {
            throw error
        }
    }
}