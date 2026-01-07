import { BookingModel, IBookingDocument } from "../../models/booking.model";
import { IBookingRepository } from "../interface/IBookingRepository";
import { BaseRepository } from "./base.repository";

export class BookingRepository extends BaseRepository<IBookingDocument> implements IBookingRepository{
    constructor(){
        super(BookingModel)
    }

  
}