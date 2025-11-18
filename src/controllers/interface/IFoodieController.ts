import { NextFunction, Request, Response } from "express";

export interface IFoodieController{
    getFoodieDashboard(req:Request,res:Response,next:NextFunction):Promise<void>;
    editFoodieProfile(req:Request,res:Response,next:NextFunction):Promise<void>;
}