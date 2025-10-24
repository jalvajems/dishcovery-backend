import { IAuthController } from "../interface/IAuthController";
import { AuthService } from "../../services/implementation/auth.services";
import { Request, Response, NextFunction } from "express";

export class AuthController implements IAuthController{
    private authService:AuthService;

    constructor(){
        this.authService=new AuthService();
    }

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