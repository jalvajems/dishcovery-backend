import { Router } from "express";
import container from "../DI/inversify.config";
import { IAuthController } from "../controllers/interface/IAuthController";
import TYPES from "../DI/types";

const router=Router();

const authController=container.get<IAuthController>(TYPES.IAuthController);

router.post('/signup',authController.signup.bind(authController));

router.post('/login',authController.login.bind(authController));

router.post('/otp-verify',authController.verifyOtp.bind(authController));


export default router;
