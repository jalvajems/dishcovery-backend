import { Request, Response, NextFunction } from "express";
import { IChefController } from "../interface/IChefController";
import { STATUS_CODE } from "../../constants/StatusCode";

export class ChefController implements IChefController{
    async getChefDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        res.status(STATUS_CODE.SUCCESS).json({message:'entered in to chef dashboard'})
    }
}