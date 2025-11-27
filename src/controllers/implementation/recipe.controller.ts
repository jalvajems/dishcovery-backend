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
        console.log('reached edit recipe');
        
        try {
            const {recipeId,recipeData}=req.body
            console.log('id',recipeId);
            console.log('data',recipeData);
            
            const result=await this._recipeService.editRecipe(recipeId,recipeData)
            res.status(STATUS_CODE.SUCCESS).json({success:true,data:result.data,message:result.message})
        } catch (error) {
            throw error;
        }
    }
    async getAllRecipesChef(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id=req.query.chefId;
            const page=Number(req.query.page)||1
            const limit=Number(req.query.limit)||5
            const search=String(req.query.search)||""
            if(!id)throw new AppError('user id is not found',STATUS_CODE.NOT_FOUND)
            const result=await this._recipeService.getAllRecipesChef(String(id),page,limit,search);
            log.info('resldata:',result.data)
            res.status(STATUS_CODE.SUCCESS).json({success:true,data:result.data,currentPage:result.currentPage,totalPages:result.totalPages,message:result.message})
        } catch (error) {
            throw error
        }
    }
    async getAllRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page=Number(req.query.page)||1;
            const limit=Number(req.query.limit)||5;
            const search=String(req.query.search)||"";

            const result=await this._recipeService.getAllRecipes(page,limit,search)
            res.status(STATUS_CODE.SUCCESS).json({success:true,datas:result.datas,currentPage:result.currentPage,total:result.totalPage})
        } catch (error) {
            next(error)
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
    async deletRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id=req.params.id;
            if(!id)throw new AppError('Recipe id is not found',STATUS_CODE.NOT_FOUND)
            const result=await this._recipeService.deleteRecipe(String(id))
            res.status(STATUS_CODE.SUCCESS).json({message:result.message})
        } catch (error) {
            throw error;
        }
    }
    async getRelatedRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            log.info('reaching1')
            const cuisine=req.params.cuisine;
            console.log('cuisine:',cuisine);
            
            const restult=await this._recipeService.getRelatedRecipes(cuisine)
            res.status(STATUS_CODE.SUCCESS).json({success:true,relatedData:restult.datas,message:restult.message})
        } catch (error) {
            next(error)
        }
    }
}