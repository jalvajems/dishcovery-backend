import { IAuthController } from "../interface/IAuthController";
import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IAuthService } from "../../services/interface/IAuthService";
import { STATUS_CODE } from "../../constants/StatusCode";
import {signupSchema, loginSchema } from "../../validations/authValidation";


@injectable()
export class AuthController implements IAuthController {
    constructor(@inject(TYPES.IAuthService) private authService: IAuthService) { }


    async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {            
            const userData=signupSchema.parse(req.body)
            const user = await this.authService.signupUser(userData)
            res.status(STATUS_CODE.CREATED).json({ success: true });
        } catch (error) {
            next(error);
        }
    }
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {            
            const  loginData= loginSchema.parse(req.body);
            const user = await this.authService.loginUser(loginData);
            res.status(STATUS_CODE.SUCCESS).json({ success: true });

        } catch (error) {
            next(error);
        }
    }
    async verifyOtp(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            console.log("reached this.verifyOtp controller");
            
            const OtpVerifyData=req.body
            const result=await this.authService.verifyOtp(OtpVerifyData);
            console.log(result,'result')
            res.status(STATUS_CODE.SUCCESS).json({success:true,message:result.msg ,data:result.user})

        } catch (error) {
            next(error);
        }
    }
}