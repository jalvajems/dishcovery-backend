import { Container } from "inversify";
import { IWorkshopRepository } from "../../repostories/interface/IWorkshopRepository";
import TYPES from "../types";
import { WorkshopRepository } from "../../repostories/implementation/workshop.repository";
import { IWorkshopController } from "../../controllers/interface/IWorkshopController";
import { WorkshopController } from "../../controllers/implementation/workshop.controller";
import { IWorkshopService } from "../../services/interface/IWorkshopService";
import { WorkshopService } from "../../services/implementation/workshop.service";

export function workshopModule(container:Container){
    container.bind<IWorkshopRepository>(TYPES.IWorkshopRepository).to(WorkshopRepository)
    container.bind<IWorkshopController>(TYPES.IWorkshopController).to(WorkshopController)
    container.bind<IWorkshopService>(TYPES.IWorkshopService).to(WorkshopService)
}