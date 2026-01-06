import {Types} from "mongoose"
import { IWorkshopDocument, WorkshopModel, WorkshopStatus,  } from "../../models/workshop.model";
import { IWorkshopRepository } from "../interface/IWorkshopRepository";
import { BaseRepository } from "./base.repository";

export class WorkshopRepository extends BaseRepository<IWorkshopDocument> implements IWorkshopRepository{
    constructor(){
        super(WorkshopModel)
    }
    async findAndUpdateToApprove(workshopId: string, adminId: string): Promise<IWorkshopDocument | null> {
        return await WorkshopModel.findByIdAndUpdate({_id:workshopId},{$set:{status:WorkshopStatus.APPROVED,approvedAt:new Date(),approvedBy:new Types.ObjectId(adminId)}},{new:true})
    }
    async findAndReject(workshopId: string, rejectionReason: string): Promise<IWorkshopDocument | null> {
        return await WorkshopModel.findByIdAndUpdate({_id:workshopId},{$set:{status:WorkshopStatus.REJECTED,rejectionReason:rejectionReason}},{new:true})
    }
    async findAndScheduled(workshopId: string): Promise<IWorkshopDocument | null> {
        return await WorkshopModel.findByIdAndUpdate({_id:workshopId},{$set:{status:WorkshopStatus.SCHEDULED}},{new:true})
    }
    async findAndStartWorkshop(workshopId: string): Promise<IWorkshopDocument | null> {
        const workshop=await WorkshopModel.findById(workshopId)
        return await WorkshopModel.findByIdAndUpdate({_id:workshopId},{$set:{status:WorkshopStatus.LIVE,isSessionActive:workshop?.mode==='online',sessionStartedAt:new Date()}},{new:true})
    }
    async findAndEndWorkshop(workshopId: string): Promise<IWorkshopDocument | null> {
        return await WorkshopModel.findByIdAndUpdate({_id:workshopId},{$set:{status:WorkshopStatus.COMPLETED,isSessionActive:false,sessionEndedAt:new Date()}})
    }
    async findAndCancelWorkshop(workshopId: string, ): Promise<IWorkshopDocument | null> {
        return await WorkshopModel.findByIdAndUpdate({_id:workshopId},{$set:{status:WorkshopStatus.CANCELLED,isSessionActive:false}})
    }
 
}