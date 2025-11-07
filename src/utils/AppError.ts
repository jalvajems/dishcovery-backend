import { STATUS_CODE } from "../constants/StatusCode";

export class AppError extends Error{
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    
    constructor(message:string,STATUS_CODE:any, isOperational=true){
        super(message);
        this.statusCode=STATUS_CODE.INTERNAL_SERVER_ERROR;
        this.isOperational=isOperational;

        Error.captureStackTrace(this,this.constructor);
    }
    
}