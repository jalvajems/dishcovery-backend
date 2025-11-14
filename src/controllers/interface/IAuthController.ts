import { Request, Response, NextFunction } from "express";

export interface IAuthController{
    signup(req:Request, res:Response, next:NextFunction): Promise<void>;
    login(req:Request, res:Response, next:NextFunction):Promise<void>,
    signupVerifyOtp(req:Request, res:Response, next:NextFunction):Promise<void>;
    forgetPass(req:Request, res:Response, next:NextFunction):Promise<void>;
    forgetPassOtpVerify(req:Request, res:Response, next:NextFunction):Promise<void>;
    resetPass(req:Request,res:Response,next:NextFunction):Promise<void>;
    refreshToken(req:Request,res:Response,next:NextFunction):Promise<void>;
    logout(req:Request,res:Response,next:NextFunction):Promise<void>;
}