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


    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {            
            const userData=signupSchema.parse(req.body)
            const user = await this.authService.registerUser(userData)
            res.status(STATUS_CODE.CREATED).json({ success: true, data: user });
        } catch (error) {
            next(error);
        }
    }
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {            
            const  loginData= loginSchema.parse(req.body);
            const user = await this.authService.loginUser(loginData);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: user });

        } catch (error) {
            next(error);
        }
    }
    async otpVerifyAndSignup(req:Request,res:Response,next:NextFunction):Promise<void>{
        try {
            
        } catch (error) {
            next(error);
        }
    }
}