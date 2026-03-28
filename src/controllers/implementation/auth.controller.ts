import { IAuthController } from "../interface/IAuthController";
import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IAuthService } from "../../services/interface/IAuthService";
import { STATUS_CODE } from "../../constants/StatusCode";
import { signupSchema, loginSchema, forgetPassSchema, changePasswordSchema } from "../../validations/authValidation";
import { env } from "../../config/env.config";
import { MESSAGES } from "../../constants/Message";


@injectable()
export class AuthController implements IAuthController {
    constructor(@inject(TYPES.IAuthService) private _authService: IAuthService) { }

    async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userData = signupSchema.parse(req.body)
            const user = await this._authService.signupUser(userData)
            res.status(STATUS_CODE.CREATED).json({ success: true, message: MESSAGES.AUTH.REGISTER_SUCCESS, otp: user.otp });
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

            const { email } = forgetPassSchema.parse(req.body);
            await this._authService.forgetPass(email);
            res.status(STATUS_CODE.SUCCESS).json({ success: true })

        } catch (error) {
            next(error);
        }
    }
    async forgetPassOtpVerify(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const OtpVerifyData = req.body;
            await this._authService.forgetPassOtp(OtpVerifyData);

            res.status(STATUS_CODE.SUCCESS).json({ success: true });
        } catch (error) {
            next(error)
        }
    }
    async resetPass(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email, newPass, confirmPass } = req.body;
            await this._authService.resetPassword(email, newPass, confirmPass);

            res.status(STATUS_CODE.SUCCESS).json({ success: true })
        } catch (error) {
            next(error)
        }
    }
    async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { email } = req.body;
            const result = await this._authService.resendOtp(email);
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
            res.status(STATUS_CODE.SUCCESS).json({ success: true, accessToken: result.accessToken, role: result.role, user: result.user })
        } catch (error) {
            next(error);
        }

    }
    async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const refreshToken = req.cookies?.refreshToken;
            if (!refreshToken) {
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: MESSAGES.AUTH.TOKEN_NEEDED });
            }
            const result = await this._authService.logout(refreshToken);

            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "strict",
            })
            res.status(STATUS_CODE.SUCCESS).json({ message: result.message })

        } catch (error) {
            next(error)
        }
    }

    async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { credential, role } = req.body;
            if (!credential) {
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Google token is required" });
                return;
            }
            const { user, accessToken, refreshToken } = await this._authService.googleAuth(credential, role || 'user');

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: env.NODE_ENV === 'production',
                sameSite: "strict",
                maxAge: Number(process.env.MAX_AGE_REFRESH),
            });

            res.status(STATUS_CODE.SUCCESS).json({ success: true, user, accessToken });
        } catch (error) {
            next(error);
        }
    }
    async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
            const userId = (req.user as any).id;
            await this._authService.changePassword(userId, currentPassword, newPassword);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "Password changed successfully" });
        } catch (error) {
            next(error);
        }
    }
}