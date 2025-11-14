import {ErrorRequestHandler} from 'express';
import {logger} from '../utils/logger';
import {AppError} from '../utils/AppError';
import { STATUS_CODE } from '../constants/StatusCode';
import { MESSAGES } from '../constants/Message';
import { ZodError } from 'zod';


export const errorHandler: ErrorRequestHandler=(err,req, res, next)=>{
    logger.error(err);
     if(err instanceof ZodError){
                console.error("Validation failed");
                err.issues.forEach(issue => {
                console.log(`Field: ${issue.path.join('.')}, Error: ${issue.message}`);
    });
  }
    
    if(err instanceof AppError){
        res.status(err.statusCode).json({
            success:false,
            message:err.message,
        });
        return;
    }

  const message = err instanceof Error ? err.message : MESSAGES.ERROR;


  res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
    success: false,
    message,
  });
};