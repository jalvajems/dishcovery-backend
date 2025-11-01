import { IAuthController } from "../interface/IAuthController";
import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IAuthService } from "../../services/interface/IAuthService";


    @injectable()
    export class AuthController implements IAuthController{
        constructor(@inject(TYPES.IAuthService)private authService:IAuthService){}


    async register(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const user=await this.authService.registerUser(req.body);
            res.status(201).json({success:true, data:user});
        } catch (error) {
            next(error)          
        }
    }
    async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {email,password}=req.body;
            const user=await this.authService.loginUser(email,password);
            res.status(200).json({success:true, data:user});
        } catch (error) { 
            next(error);
        }
    }
}