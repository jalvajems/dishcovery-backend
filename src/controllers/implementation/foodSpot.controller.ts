import { inject, injectable } from "inversify";
import { IFoodSpotController } from "../interface/IFoodSpotController";
import TYPES from "../../DI/types";
import { IFoodSpotService } from "../../services/interface/IFoodSpotService";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { success } from "zod";

@injectable()
export class FoodSpotController implements IFoodSpotController {
    constructor(
        @inject(TYPES.IFoodSpotService) private _foodSpotService: IFoodSpotService
    ) { }

    async createFoodSpot(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const foodieId = req.user?.id
            if (!foodieId) throw new AppError('Foodie is not authenticated', STATUS_CODE.UNAUTHORIZED)

            console.log('===========', req.body);


            const result = await this._foodSpotService.createFoodSpot({ foodieId, ...req.body })
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, message: 'created successfully!' })
        } catch (error) {
            next(error)
        }
    }
    async getFoodSpot(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) throw new AppError('Foodie is not authenticated', STATUS_CODE.UNAUTHORIZED)
            const result = await this._foodSpotService.getFoodSpot(id);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, message: 'successfully got spots' })

        } catch (error) {
            next(error)
        }
    }
    async updateFoodSpot(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const { id, payload } = req.body;
            await this._foodSpotService.updateFoodSpot(id, payload)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: 'successfully updated spot;' })
        } catch (error) {
            next(error);
        }
    }
    async getNearByFoodSpots(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { lat, lng, distance = 5000 } = req.query;
            if (!lat || !lng) {
                throw new AppError("latitude and longitude require", STATUS_CODE.BAD_REQUEST)
            }
            const result = await this._foodSpotService.getNearByFoodSpot(Number(lat), Number(lng), Number(distance));

            res.status(200).json({ success: true, data: result.data, message: "nearby food spot fetched!!" })
        } catch (error) {
            next(error)
        }
    }
    async getAllFoodSpots(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 5;
            const search = String(req.query.search) || "";
            const filter = String(req.query.filter) || "";

            const result = await this._foodSpotService.getAllFoodSpots(page, limit, search, filter);
            console.log('result--------', result.data);

            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, totalCount: result.totalCount, message: 'got all food spot successfully' });

        } catch (error) {
            next(error)
        }
    }
    async getAllFoodSpotsByFoodie(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.user?.id;
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 5
            const search = String(req.query.search) || ""
            if (!id) throw new AppError('Foodie is not authenticated', STATUS_CODE.UNAUTHORIZED);
            const result = await this._foodSpotService.getAllFoodSpotsByFoodie(id, page, limit, search);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, totalCount: result.totalCount, message: 'got all spot successfully' });

        } catch (error) {
            next(error);
        }
    }
}