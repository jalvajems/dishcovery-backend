import { Container } from "inversify";
import TYPES from "../types";
import { INotificationRepository } from "../../repositories/interfaces/INotificationRepository";
import { NotificationRepository } from "../../repositories/implementation/notification.repository";
import { INotificationService } from "../../services/interface/INotificationService";
import { NotificationService } from "../../services/implementation/notification.service";
import { INotificationController } from "../../controllers/interface/INotificationController";
import { NotificationController } from "../../controllers/implementation/notification.controller";

const notificationModule = (container: Container) => {
    container.bind<INotificationRepository>(TYPES.INotificationRepository).to(NotificationRepository);
    container.bind<INotificationService>(TYPES.INotificationService).to(NotificationService);
    container.bind<INotificationController>(TYPES.INotificationController).to(NotificationController);
}

export default notificationModule;
