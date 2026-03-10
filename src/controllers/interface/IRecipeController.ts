import { NextFunction, Request, Response } from "express";

export interface IRecipeController {
    addRecipe(req:Request,res:Response,next:NextFunction):Promise<void>;
    editRecipe(req:Request,res:Response,next:NextFunction):Promise<void>;
    getAllRecipes(req:Request,res:Response,next:NextFunction):Promise<void>;
    getRecipeDetail(req:Request,res:Response,next:NextFunction):Promise<void>;
    deletRecipe(req:Request,res:Response,next:NextFunction):Promise<void>;
}
