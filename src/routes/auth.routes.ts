import { Router } from "express";
import container from "../DI/inversify.config";
import { IAuthController } from "../controllers/interface/IAuthController";
import TYPES from "../DI/types";
import { blockGuard } from "../middlewares/BlockGuard";


const router = Router();


const authController = container.get<IAuthController>(TYPES.IAuthController);

router.post('/signup', authController.signup.bind(authController))
    .post('/login', blockGuard, authController.login.bind(authController))
    .post('/signup-otp-verify', authController.signupVerifyOtp.bind(authController))
    .post('/forgetPassword', authController.forgetPass.bind(authController))
    .post('/forget-otp-verify', authController.forgetPassOtpVerify.bind(authController))
    .post('/resetPassword', authController.resetPass.bind(authController))
    .post('/refresh', authController.refreshToken.bind(authController))
    .post('/logout', authController.logout.bind(authController))
    .post('/resend-otp', authController.resendOtp.bind(authController))

export default router;
