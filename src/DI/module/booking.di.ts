import { Container } from "inversify";
import TYPES from "../types";
import { IBookingController } from "../../controllers/interface/IBookingController";
import { BookingController } from "../../controllers/implementation/booking.controller";
import { IBookingService } from "../../services/interface/IBookingService";
import { BookingService } from "../../services/implementation/booking.service";
import { BookingRepository } from "../../repostories/implementation/booking.repository";
import { IBookingRepository } from "../../repostories/interface/IBookingRepository";

export function bookingModule(container:Container){
    container.bind<IBookingController>(TYPES.IBookingController).to(BookingController),
    container.bind<IBookingService>(TYPES.IBookingService).to(BookingService),
    container.bind<IBookingRepository>(TYPES.IBookingRepository).to(BookingRepository)

}