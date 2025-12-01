import { NextFunction, Request, Response } from "express";

export interface IChefController{
    getChefDashboard(req:Request,res:Response,next:NextFunction):Promise<void>;
    createProfile(req:Request,res:Response,next:NextFunction):Promise<void>;
    updateProfile(req:Request,res:Response,next:NextFunction):Promise<void>;
    getProfile(req:Request,res:Response,next:NextFunction):Promise<void>;
}