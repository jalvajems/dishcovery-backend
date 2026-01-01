import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'
import { AppError } from "../utils/AppError"
import { STATUS_CODE } from "../constants/StatusCode"
import { env } from '../config/env.config';

export const authorizeRole=(...allowedRoles:string[])=>{
    return(req:Request,res:Response,next:NextFunction)=>{
        
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ message: 'Accesss token is missing' })
    }

        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: string, role: string };
        req.user = decoded
        if(!req.user){
            throw new AppError('user not authenticated',STATUS_CODE.UNAUTHORIZED);
        }
        if(!allowedRoles.includes(req.user.role)){
            throw new AppError('Access denied: no permission',STATUS_CODE.FORBIDDEN);
        }
        next()
    }
}