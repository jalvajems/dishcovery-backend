import { IAuthController } from "../interface/IAuthController";
import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IAuthService } from "../../services/interface/IAuthService";
import { STATUS_CODE } from "../../constants/StatusCode";
import { signupSchema, loginSchema } from "../../validations/authValidation";
import { env } from "../../config/env.config";
import { log } from "winston";


@injectable()
export class AuthController implements IAuthController {
    constructor(@inject(TYPES.IAuthService) private _authService: IAuthService) { }


    async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userData = signupSchema.parse(req.body)
            const user = await this._authService.signupUser(userData)
            res.status(STATUS_CODE.CREATED).json({ success: true,message:'Signup succussfully !!',otp:user.otp });
        } catch (error) {
            next(error);
        }
    }
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const loginData = loginSchema.parse(req.body);
            const { user, accessToken, refreshToken } = await this._authService.loginUser(loginData);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: "strict",
                maxAge: Number(process.env.MAX_AGE_REFRESH),
            })
             res.status(STATUS_CODE.SUCCESS).json({ success: true, user, accessToken });

        } catch (error) {
            next(error);
        }
    }
    async signupVerifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            
            const OtpVerifyData = req.body
            const result = await this._authService.signupOtp(OtpVerifyData);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: result.msg, data: result.user })

        } catch (error) {
            next(error);
        }
    }
    async forgetPass(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const { email } = req.body;
            const result = await this._authService.forgetPass(email);
            res.status(STATUS_CODE.SUCCESS).json({ success: true })

        } catch (error) {
            next(error);
        }
    }
    async forgetPassOtpVerify(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const OtpVerifyData = req.body;
            const result = await this._authService.forgetPassOtp(OtpVerifyData);

            res.status(STATUS_CODE.SUCCESS).json({ success: true });
        } catch (error) {
            next(error)
        }
    }
    async resetPass(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, newPass, confirmPass } = req.body;
            const result = await this._authService.resetPassword(email, newPass, confirmPass);

            res.status(STATUS_CODE.SUCCESS).json({ success: true })
        } catch (error) {
            next(error)
        }
    }
    async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {email}=req.body;
            const result=await this._authService.resendOtp(email);
            res.status(STATUS_CODE.SUCCESS).json(result)
        } catch (error) {
            next(error)
        }
    }
    async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {

        try {
            const cookieToken = req.cookies.refreshToken;
            const result = await this._authService.refreshToken(cookieToken)
            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: "strict",
                maxAge: Number(process.env.MAX_AGE_REFRESH),
            })
            res.status(STATUS_CODE.SUCCESS).json({ success: true, accessToken: result.accessToken ,role:result.role})
        } catch (error) {
            next(error);
        }

    }
    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            
            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: 'refresh token needed' });
            }
            const result = await this._authService.logout(refreshToken);

            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "strict",
            })
            res.status(STATUS_CODE.SUCCESS).json({message:result.message})

        } catch (error) {
            next(error)
        }
    }
}