import {Request, Response, NextFunction} from 'express';
import {demoService} from '../../services/implementation/demo.service'
import { success } from 'zod';
import { AppError } from '../../utils/AppError';

export const demoController={
    async getMessage(req:Request, res:Response, next:NextFunction){
        try {
            const result=await demoService.getDemoMessage()
            res.status(200).json({
                success:true,
                message:'controller reached successfully',
                data:result,
            })
        } catch (error) {
            next(error)
        }
    }
}

export const demoError={
    async getError(req:Request, res:Response, next:NextFunction){
        try {
            throw new AppError("Something went wrong on demo controller",400)
        } catch (error) {
            next(error);
        }
    }
}