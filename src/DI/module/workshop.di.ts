import { Container } from "inversify";
import TYPES from "../types";
import { IWorkshopRepository } from "../../repostories/interface/IWorkshopRepository";
import { WorkshopRepository } from "../../repostories/implementation/workshop.repository";
import { IWorkshopService } from "../../services/interface/IWorkshopService";
import { WorkshopService } from "../../services/implementation/workshop.service";
import { IWorkshopController } from "../../controllers/interface/IWorkshopController";
import { WorkshopController } from "../../controllers/implementation/workshop.controller";
import { IBookingRepository } from "../../repostories/interface/IBookingRepository";
import { BookingRepository } from "../../repostories/implementation/booking.repository";
import { IBookingService } from "../../services/interface/IBookingService";
import { BookingService } from "../../services/implementation/booking.service";
import { IBookingController } from "../../controllers/interface/IBookingController";
import { BookingController } from "../../controllers/implementation/booking.controller";
import { IStripeService } from "../../services/interface/IStripeService";
import { StripeService } from "../../services/implementation/stripe.service";
import { IWorkshopSessionRepository } from "../../repostories/interface/IWorkshopSessionRepository";
import { WorkshopSessionRepository } from "../../repostories/implementation/workshopSession.repository";
import { IWorkshopSessionService } from "../../services/interface/IWorkshopSessionService";
import { WorkshopSessionService } from "../../services/implementation/workshopSession.service";

import { IWorkshopSessionController } from "../../controllers/interface/IWorkshopSessionController";
import { WorkshopSessionController } from "../../controllers/implementation/workshopSession.controller";
import { ICronService } from "../../services/interface/ICronService";
import { CronService } from "../../services/implementation/cron.service";

export default function workshopModule(container: Container) {
    container.bind<IWorkshopRepository>(TYPES.IWorkshopRepository).to(WorkshopRepository);
    container.bind<IWorkshopService>(TYPES.IWorkshopService).to(WorkshopService);
    container.bind<IWorkshopController>(TYPES.IWorkshopController).to(WorkshopController);

    container.bind<IBookingRepository>(TYPES.IBookingRepository).to(BookingRepository);
    container.bind<IStripeService>(TYPES.IStripeService).to(StripeService);
    container.bind<IBookingService>(TYPES.IBookingService).to(BookingService);
    container.bind<IBookingController>(TYPES.IBookingController).to(BookingController);

    container.bind<IWorkshopSessionRepository>(TYPES.WorkshopSessionRepository).to(WorkshopSessionRepository);
    container.bind<IWorkshopSessionService>(TYPES.WorkshopSessionService).to(WorkshopSessionService);
    container.bind<IWorkshopSessionController>(TYPES.WorkshopSessionController).to(WorkshopSessionController);

    container.bind<ICronService>(TYPES.ICronService).to(CronService);
}
