import { ZodObject } from "zod";
import e, { Request, Response, NextFunction } from "express";
import { STATUS_CODE } from "../constants/StatusCode";
import { AppError } from "../utils/AppError";

export const validate=(schema:ZodObject)=>(req:Request,res:Response,next:NextFunction)=>{
    try {
        req.body=schema.parse(req.body)
        next();
    } catch (error:any) {
        const message = error || "Validation failed";
      next(new AppError(message, STATUS_CODE.BAD_REQUEST));
    }
}