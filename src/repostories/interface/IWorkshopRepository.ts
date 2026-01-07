import { IWorkshopDocument } from "../../models/workshop.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IWorkshopRepository extends IBaseRepository<IWorkshopDocument>{
    findAndUpdateToApprove(workshopId:string,adminId:string):Promise<IWorkshopDocument|null>
    findAndReject(workshopId:string,rejectionReason:string):Promise<IWorkshopDocument|null>;
    findAndScheduled(workshopId:string):Promise<IWorkshopDocument|null>;
    findAndStartWorkshop(workshopId:string):Promise<IWorkshopDocument|null>;
    findAndEndWorkshop(workshopId:string):Promise<IWorkshopDocument|null>;
    findAndCancelWorkshop(workshopId:string):Promise<IWorkshopDocument|null>;
    incrementBooking(workshopId:string):Promise<IWorkshopDocument|null>
    reserveSlotIfAvailable(workshopId:string):Promise<IWorkshopDocument|null>;
decrementBooking(workshopId:string):Promise<IWorkshopDocument|null>;
}