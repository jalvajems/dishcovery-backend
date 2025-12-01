import { NextFunction, Request, Response } from "express";

export interface IFoodieController{
    getFoodieDashboard(req:Request,res:Response,next:NextFunction):Promise<void>;
    getAllRecipes(req:Request,res:Response,next:NextFunction):Promise<void>;
    getRecipeDetail(req:Request,res:Response,next:NextFunction):Promise<void>;

    createProfile(req:Request,res:Response,next:NextFunction):Promise<void>
    updateProfile(req:Request,res:Response,next:NextFunction):Promise<void>
    getProfile(req:Request,res:Response,next:NextFunction):Promise<void>
}