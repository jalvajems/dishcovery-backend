import { NextFunction, Request, Response } from "express"
import { AppError } from "../utils/AppError"
import { STATUS_CODE } from "../constants/StatusCode"

export const authorizeRole=(...allowedRoles:string[])=>{
    return(req:Request,res:Response,next:NextFunction)=>{

        if(!req.user){
            throw new AppError('user not authenticated',STATUS_CODE.UNAUTHORIZED);
        }
        if(!allowedRoles.includes(req.user.role)){
            throw new AppError('Access denied: no permission',STATUS_CODE.FORBIDDEN);
        }
        next()
    }
}