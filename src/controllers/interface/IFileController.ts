import { NextFunction, Request, Response } from "express";

export interface IFileController{
    signedUrl(req:Request,res:Response,next:NextFunction):Promise<void>;
}