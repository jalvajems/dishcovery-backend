import { Container } from "inversify";
import { IAdminService } from "../../services/interface/IAdminService";
import TYPES from "../types";
import { AdminService } from "../../services/implementation/admin.service";
import { IAdminController } from "../../controllers/interface/IAdminController";
import { AdminController } from "../../controllers/implementation/admin.controller";

export function adminModule(container: Container) {
    container.bind<IAdminService>(TYPES.IAdminService).to(AdminService),
    container.bind<IAdminController>(TYPES.IAdminController).to(AdminController)
}