import { IWorkshopResponseDTO } from "../../dtos/workshopResponse.dtos";
import { IWorkshopDocument } from "../../models/workshop.model";

export interface IWorkshopService {
    createWorkshop(payload:object):Promise<{data:IWorkshopResponseDTO}>;
    approveWorkshop(workshopId:string,adminId:string):Promise<void>;
    rejectWorkshop(workshopId:string,reason:string):Promise<void>;
    markWorkshopAsScheduled(workshopId:string):Promise<void>;
    startWorkshop(workshopId:string,chefId:string):Promise<void>;
    endWorkshop(workshopId:string,chefId:string):Promise<void>;
    cancelWorkshop(workshopId:string,cancelledBy:'admin'|'chef'):Promise<void>;
}