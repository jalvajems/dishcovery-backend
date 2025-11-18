import { Request, Response, NextFunction } from "express";
import { IAdminController } from "../interface/IAdminController";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IAdminService } from "../../services/interface/IAdminService";
import { STATUS_CODE } from "../../constants/StatusCode";
import { query } from "winston";

@injectable()
export class AdminController implements IAdminController{
    constructor(
        @inject(TYPES.IAdminService) private adminService:IAdminService,
    ){}
    async getAllFoodies(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page=Number(req.query.page)||1;
            const limit=Number(req.query.limit)||10;
            const search=(req.query.search as string)||"";
            const isBlocked=req.query.isBlocked as string;

            const result=await this.adminService.getAllFoodies({
                page,limit,search,isBlocked,
            })

            res.status(STATUS_CODE.SUCCESS).json(result)
        } catch (error) {
            next(error)
        }
    }
    async getAllChefs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page=Number(req.query.page)||1;
            const limit=Number(req.query.limit)||10;
            const search=(req.query.search as string)||"";
            const isBlocked=req.query.isBlocked as string;
            const isVerified=req.query.isVerified as string;
            const result=await this.adminService.getAllChefs({
                page,limit,search,isBlocked,isVerified
            })
            res.status(STATUS_CODE.SUCCESS).json(result)
        } catch (error) {
            next(error);
        }
    }
    async blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id=req.params.id;
            const restult=await this.adminService.blockUserById(id)
            res.status(STATUS_CODE.SUCCESS).json({restult})
        } catch (error) {
            next(error);
        }
    }
    async unBlockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id=req.params.id;
            const restult=await this.adminService.unBlockUserById(id)
            res.status(STATUS_CODE.SUCCESS).json({restult})
        } catch (error) {
            next(error)
        }
    }
    async verifyChef(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id=req.params.id;
            const result=await this.adminService.verifyChef(id);
            res.status(STATUS_CODE.SUCCESS).json({result});
        } catch (error) {
            next(error);
        }
    }
    async unVerifyChef(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id=req.params.id;
            const result=await this.adminService.unVerifyChef(id);
            res.status(STATUS_CODE.SUCCESS).json({result});
        } catch (error) {
            next(error);
        }
    }
}