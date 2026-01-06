import { inject, injectable } from "inversify";
import { IWorkshopController } from "../interface/IWorkshopController";
import TYPES from "../../DI/types";
import { IWorkshopService } from "../../services/interface/IWorkshopService";
import { Request, Response, NextFunction } from "express";
import { STATUS_CODE } from "../../constants/StatusCode";
import { success } from "zod";
import { AppError } from "../../utils/AppError";

@injectable()
export class WorkshopController implements IWorkshopController{
    constructor(
        @inject(TYPES.IWorkshopService) private _workshopService:IWorkshopService,
    ){}
    async createWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const payload=req.body;
            const result= await this._workshopService.createWorkshop(payload)
            res.status(STATUS_CODE.CREATED).json({success:true, data:result.data, message:'workshop created successfully!'})
            
        } catch (error) {
            next(error)
        }
    }
    async appproveWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {workshopId}=req.body;
            const adminId=process.env.ADMIN_ID;
            if(!adminId)throw new AppError('admin id is not found',STATUS_CODE.NOT_FOUND);
            const result=await this._workshopService.approveWorkshop(workshopId,adminId)
            res.status(STATUS_CODE.SUCCESS).json({success:true, message:'workshop approved successfully!'})
        } catch (error) {
            next(error)
        }
        
    }
    async rejectWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {workshopId,reason}=req.body;
            const result = await this._workshopService.rejectWorkshop(workshopId,reason)
            res.status(STATUS_CODE.SUCCESS).json({success:true, message:'workshop rejected successfully!'})
        } catch (error) {
            next(error)
        }
        
    }
    async markWorkshopAsScheduled(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {workshopId}=req.body;
            const result = await this._workshopService.markWorkshopAsScheduled(workshopId)
            res.status(STATUS_CODE.SUCCESS).json({success:true, message:'workshop scheduled successfully!'})
            
        } catch (error) {
            next(error)
        }
        
    }
    async startWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {workshopId,chefId}=req.body;
            const result = await this._workshopService.startWorkshop(workshopId,chefId)
            res.status(STATUS_CODE.SUCCESS).json({success:true, message:'workshop marked started successfully!'})
            
        } catch (error) {
            next(error)
        }
        
    }
    async endWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {workshopId,chefId}=req.body;
            const result = await this._workshopService.endWorkshop(workshopId,chefId)
            res.status(STATUS_CODE.SUCCESS).json({success:true, message:'workshop marked ended successfully!'})
            
        } catch (error) {
            next(error)
        }
        
    }
    async cancelWorkshopByAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            
            const {workshopId}=req.body;
            const result = await this._workshopService.cancelWorkshop(workshopId,'admin')
            res.status(STATUS_CODE.SUCCESS).json({success:true, message:'workshop scheduled successfully!'})
            
        } catch (error) {
            next(error)
        }
        
    }
    async cancelWorkshopByChef(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const {workshopId}=req.body;
            const result = await this._workshopService.cancelWorkshop(workshopId,'chef')
            res.status(STATUS_CODE.SUCCESS).json({success:true, message:'workshop scheduled successfully!'})
            
        } catch (error) {
            next(error)
        }
        
    }
}