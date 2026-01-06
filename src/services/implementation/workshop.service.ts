import { inject, injectable } from "inversify";
import { IWorkshopService } from "../interface/IWorkshopService";
import TYPES from "../../DI/types";
import { IWorkshopRepository } from "../../repostories/interface/IWorkshopRepository";
import { IWorkshopResponseDTO } from "../../dtos/workshopResponse.dtos";
import { WorkshopStatus } from "../../models/workshop.model";
import { workshopMapper } from "../../utils/mapper/workshop.mapper";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";

@injectable()
export class WorkshopService implements IWorkshopService{
    constructor(
        @inject(TYPES.IWorkshopRepository) private _workshopRepository:IWorkshopRepository
    ){}
    async createWorkshop(payload: object): Promise<{ data: IWorkshopResponseDTO; }> {
        try {
            const workshop=await this._workshopRepository.create({
                ...payload,
                status:WorkshopStatus.PENDING
            })
            return{data:workshopMapper(workshop)}
        } catch (error) {
            throw error;
        }
    }
    async approveWorkshop(workshopId: string, adminId: string): Promise<void> {
        try {
            const workshop=await this._workshopRepository.findById(workshopId);
            if(!workshop)throw new AppError('workshop not found',STATUS_CODE.NOT_FOUND)
            if(workshop.status!==WorkshopStatus.PENDING){
                throw new AppError('workshop is not pending approval',STATUS_CODE.BAD_REQUEST)
            }
            await this._workshopRepository.findAndUpdateToApprove(workshopId,adminId)
            return ;
        } catch (error) {
            throw error;
        }
    }
    async rejectWorkshop(workshopId: string, reason: string): Promise<void> {
        try {
            const workshop=await this._workshopRepository.findById(workshopId);
            
            if(!workshop)throw new AppError('workshop not found',STATUS_CODE.NOT_FOUND)
                if(workshop.status!==WorkshopStatus.PENDING)throw new AppError('workshop cannot reject as its pending',STATUS_CODE.CONFLICT);
            
            const updatedData=await this._workshopRepository.findAndReject(workshopId,reason)
            
            if(!updatedData){
                throw new AppError('failed to update workshop to reject',STATUS_CODE.INTERNAL_SERVER_ERROR)
            }
            return;
        } catch (error) {
            throw error;
        }
    }
    async markWorkshopAsScheduled(workshopId: string): Promise<void> {
        try {
            const workshop = await this._workshopRepository.findById(workshopId);
            
            if(!workshop)throw new AppError('workshop not found',STATUS_CODE.NOT_FOUND)
                if(workshop.status!==WorkshopStatus.APPROVED){
                      throw new AppError("Workshop must be approved first", STATUS_CODE.BAD_REQUEST);

                } ;
            
            const updatedData=await this._workshopRepository.findAndScheduled(workshopId)
            if(!updatedData){
                throw new AppError('failed to update workshop to schedule',STATUS_CODE.INTERNAL_SERVER_ERROR)
            }
            return;
            
        } catch (error) {
            throw error;
        }
    }
    async startWorkshop(workshopId: string, chefId: string): Promise<void> {
        try {
            const workshop = await this._workshopRepository.findById(workshopId);
            
            if(!workshop)throw new AppError('workshop not found',STATUS_CODE.NOT_FOUND)
                if(workshop.chefId.toString() !== chefId) throw new AppError('not authorized',STATUS_CODE.UNAUTHORIZED)
                    
                    if(![WorkshopStatus.APPROVED,WorkshopStatus.SCHEDULED].includes(workshop.status)){
                        throw new AppError('Workshop cannot be started',STATUS_CODE.BAD_REQUEST);
                    }
                    const now=new Date();
                    if(now<workshop.startDateTime){
                        throw new AppError('Workshop cannot start before scheduled time',STATUS_CODE.CONFLICT)
                    }
                    
                    const updatedData=await this._workshopRepository.findAndStartWorkshop(workshopId);
                    if(!updatedData){
                        throw new AppError('failed to update workshop to start',STATUS_CODE.INTERNAL_SERVER_ERROR)
                    }
                    return;
                    
                    
                } catch (error) {
                    throw error;
                }
                
            }
            async endWorkshop(workshopId: string, chefId: string): Promise<void> {
                try {
                    const workshop = await this._workshopRepository.findById(workshopId);
                    
                    if(!workshop)throw new AppError('workshop not found',STATUS_CODE.NOT_FOUND)
                        if(workshop.chefId.toString() !== chefId) throw new AppError('not authorized',STATUS_CODE.UNAUTHORIZED)
                            if(workshop.status!==WorkshopStatus.LIVE)throw new AppError('workshop is not live',STATUS_CODE.BAD_REQUEST)
                                
                                const updatedData=await this._workshopRepository.findAndEndWorkshop(workshopId);
                                if(!updatedData){
                                    throw new AppError('failed to update workshop to end',STATUS_CODE.INTERNAL_SERVER_ERROR)
                                }
                                return;
                                
                            } catch (error) {
                                throw error;
                            }
                        }
                        async cancelWorkshop(workshopId: string, cancelledBy: "admin" | "chef"): Promise<void> {
                            try {
                                const workshop = await this._workshopRepository.findById(workshopId);
                                
                                if(!workshop)throw new AppError('workshop not found',STATUS_CODE.NOT_FOUND)
                                    
                                    if([WorkshopStatus.COMPLETED,WorkshopStatus.CANCELLED].includes(workshop.status)){
                                        throw new AppError('Workshop cannot be cancelled',STATUS_CODE.BAD_REQUEST)
                                    }
                                    
                                    const updatedData= await this._workshopRepository.findAndCancelWorkshop(workshopId)
                                    if(!updatedData){
                                        throw new AppError('failed to update workshop to end',STATUS_CODE.INTERNAL_SERVER_ERROR)
                                    }
                                    return;
                                
                            } catch (error) {
                                throw error;
                            }
                        }
}