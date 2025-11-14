import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.config';
import { log } from '../utils/logger';
 


export const verifyAccess=async(req:Request,res:Response,next:NextFunction)=>{

    console.log("middleware 1")
    const authHeader=req.headers['authorization'];
    const token=authHeader && authHeader.split(' ')[1];

    if(!token){
        return res.status(401).json({message:'Accesss token is missing'})
    }
    try {
        const decoded = jwt.verify(token,env.JWT_ACCESS_SECRET);
        req.user = decoded as {id:string,role:string};
        next()
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired access token' });

    }
};
