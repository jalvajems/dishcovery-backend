import { NextFunction, Request, Response } from "express";

export interface IWalletController{
 foodieWallet(req:Request,res:Response,next:NextFunction):Promise<void>;   
 chefWallet(req:Request,res:Response,next:NextFunction):Promise<void>;   
}