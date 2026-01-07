import { NextFunction, Request, Response } from "express";

export interface IBookingController{
    bookWorkshop(req:Request,res:Response,next:NextFunction):Promise<void>;
}