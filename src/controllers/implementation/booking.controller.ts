import { inject, injectable } from "inversify";
import { IBookingController } from "../interface/IBookingController";
import TYPES from "../../DI/types";
import { IBookingService } from "../../services/interface/IBookingService";
import { Request, Response, NextFunction } from "express";

@injectable()
export class BookingController implements IBookingController{
    constructor(
@inject(TYPES.IBookingService)private _bookingService:IBookingService
    ){}

    async bookWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // const userId=req.user?.id;
            const {workshopId,userId}=req.body;
            await this._bookingService.bookWorkshop(workshopId,userId)
            res.status(201).json({
      success: true,
      message: "Workshop booking initiated",
    });

        } catch (error) {
            next(error)
        }
    }
}