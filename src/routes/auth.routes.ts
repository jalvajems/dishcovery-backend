import { Router } from "express";
import container from "../DI/inversify.config";
import { IAuthController } from "../controllers/interface/IAuthController";
import TYPES from "../DI/types";

const router=Router();

const authController=container.get<IAuthController>(TYPES.IAuthController);

router.post('/signup',authController.register.bind(authController));
router.post('/login',authController.login.bind(authController));


export default router;