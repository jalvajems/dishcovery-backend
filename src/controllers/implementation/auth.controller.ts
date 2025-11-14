import { IAuthController } from "../interface/IAuthController";
import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IAuthService } from "../../services/interface/IAuthService";
import { STATUS_CODE } from "../../constants/StatusCode";
import { signupSchema, loginSchema } from "../../validations/authValidation";
import strict from "assert/strict";
import { env } from "../../config/env.config";
import { log } from "../../utils/logger";
import { success } from "zod";


@injectable()
export class AuthController implements IAuthController {
    constructor(@inject(TYPES.IAuthService) private authService: IAuthService) { }


    async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userData = signupSchema.parse(req.body)
            const user = await this.authService.signupUser(userData)
            res.status(STATUS_CODE.CREATED).json({ success: true });
        } catch (error) {
            next(error);
        }
    }
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const loginData = loginSchema.parse(req.body);
            const { user, accessToken, refreshToken } = await this.authService.loginUser(loginData);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            console.log("login refresh",req.cookies.refreshToken)
             res.status(STATUS_CODE.SUCCESS).json({ success: true, user, accessToken });

        } catch (error) {
              console.log("login refresh",error)
            next(error);
        }
    }
    async signupVerifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const OtpVerifyData = req.body
            const result = await this.authService.signupOtp(OtpVerifyData);
            console.log(result, 'result')
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: result.msg, data: result.user })

        } catch (error) {
            next(error);
        }
    }
    async forgetPass(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const { email } = req.body;
            console.log('emailreached in body===', email);
            const result = await this.authService.forgetPass(email);
            console.log("result-->", result);
            res.status(STATUS_CODE.SUCCESS).json({ success: true })

        } catch (error) {
            next(error);
        }
    }
    async forgetPassOtpVerify(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('reached forgotpass otpverifty');

            const OtpVerifyData = req.body;
            const result = await this.authService.forgetPassOtp(OtpVerifyData);
            console.log("result-->", result);
            res.status(STATUS_CODE.SUCCESS).json({ success: true });
        } catch (error) {
            next(error)
        }
    }
    async resetPass(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, newPass, confirmPass } = req.body;
            const result = await this.authService.resetPassword(email, newPass, confirmPass);

            res.status(STATUS_CODE.SUCCESS).json({ success: true })
        } catch (error) {
            next(error)
        }
    }
    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {

        try {
            const cookieToken = req.cookies.refreshToken;
            const result = await this.authService.refreshToken(cookieToken)
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            res.status(STATUS_CODE.SUCCESS).json({ success: true, accessToken: result.accessToken })
        } catch (error) {
            next(error);
        }

    }
    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('reached logout');
            
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                console.log("checking 1")
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: 'refresh token needed' });
            }
            const result = await this.authService.logout(refreshToken);
            console.log("checking 1")
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "strict",
            })
            res.status(STATUS_CODE.SUCCESS).json({message:result.message})

        } catch (error) {
            console.error(error)
            next(error)
        }
    }
}