import { NextFunction, Request, Response } from "express";

export interface IChefController{
    getChefDashboard(req:Request,res:Response,next:NextFunction):Promise<void>;
}