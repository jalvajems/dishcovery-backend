import { NextFunction, Request, Response } from "express";

export interface IWorkshopController{
    createWorkshop(req:Request,res:Response,next:NextFunction):Promise<void>;
    appproveWorkshop(req:Request,res:Response,next:NextFunction):Promise<void>;
    rejectWorkshop(req:Request,res:Response,next:NextFunction):Promise<void>;
    markWorkshopAsScheduled(req:Request,res:Response,next:NextFunction):Promise<void>;
    startWorkshop(req:Request,res:Response,next:NextFunction):Promise<void>;
    endWorkshop(req:Request,res:Response,next:NextFunction):Promise<void>;
    cancelWorkshopByAdmin(req:Request,res:Response,next:NextFunction):Promise<void>;
    cancelWorkshopByChef(req:Request,res:Response,next:NextFunction):Promise<void>;
}