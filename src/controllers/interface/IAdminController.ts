import { NextFunction, Request, Response } from "express";

export interface IAdminController{
    getAllFoodies(req:Request,res:Response,next:NextFunction):Promise<void>;
    getAllChefs(req:Request,res:Response,next:NextFunction):Promise<void>;
    blockUser(req:Request,res:Response,next:NextFunction):Promise<void>;
    unBlockUser(req:Request,res:Response,next:NextFunction):Promise<void>;
    verifyChef(req:Request,res:Response,next:NextFunction):Promise<void>;
    unVerifyChef(req:Request,res:Response,next:NextFunction):Promise<void>;
    getAllRecipes(req:Request,res:Response,next:NextFunction):Promise<void>;

}