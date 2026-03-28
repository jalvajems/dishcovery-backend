import { inject, injectable } from "inversify";
import { IFoodSpotController } from "../interface/IFoodSpotController";
import TYPES from "../../DI/types";
import { IFoodSpotService } from "../../services/interface/IFoodSpotService";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";

import { FOODSPOT_MESSAGES, MESSAGES } from "../../constants/Message";
import { ISaveRepository } from "../../repostories/interface/ISaveRepository";

@injectable()
export class FoodSpotController implements IFoodSpotController {
    constructor(
        @inject(TYPES.IFoodSpotService) private _foodSpotService: IFoodSpotService,
        @inject(TYPES.ISaveRepository) private _saveRepository: ISaveRepository
    ) { }

    async createFoodSpot(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const foodieId = req.user?.id
            if (!foodieId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED)

            console.log('===========', req.body);


            const result = await this._foodSpotService.createFoodSpot({ foodieId, ...req.body })
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, message: FOODSPOT_MESSAGES.CREATED })
        } catch (error) {
            next(error)
        }
    }
    async getFoodSpot(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const spotId = req.params.id;
            const userId = req.user?.id;

            if (!spotId) throw new AppError(FOODSPOT_MESSAGES.NOT_FOUND, STATUS_CODE.UNAUTHORIZED)

            const result = await this._foodSpotService.getFoodSpot(spotId);

            let isSaved = false;
            if (userId) {
                const user = await this._saveRepository.findById(userId);
                isSaved = !!user?.savedFoodSpots?.includes(spotId);
            }

            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, isSaved, message: FOODSPOT_MESSAGES.SPOT_FETCHED })

        } catch (error) {
            next(error)
        }
    }
    async updateFoodSpot(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const { id, payload } = req.body;
            await this._foodSpotService.updateFoodSpot(id, payload)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: FOODSPOT_MESSAGES.UPDATED })
        } catch (error) {
            next(error);
        }
    }
    async getNearByFoodSpots(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { lat, lng, distance = 5000 } = req.query;
            if (!lat || !lng) {
                throw new AppError(FOODSPOT_MESSAGES.LAT_LONG_REQUIRED, STATUS_CODE.BAD_REQUEST)
            }
            const result = await this._foodSpotService.getNearByFoodSpot(Number(lat), Number(lng), Number(distance));

            res.status(200).json({ success: true, data: result.data, message: FOODSPOT_MESSAGES.NEAR_SPOT_FETCHED })
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
            const sortBy = String(req.query.sortBy) || "";
            const userId = req.user?.id;

            const result = await this._foodSpotService.getAllFoodSpots(page, limit, search, filter, sortBy, userId);
            console.log('result--------', result.data);

            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, totalCount: result.totalCount, message: FOODSPOT_MESSAGES.FETCHED_ALL });

        } catch (error) {
            next(error)
        }
    }
    async getAllFoodSpotsByFoodie(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('reachef my');

            const userId = req.user?.id;
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 5
            const search = String(req.query.search) || ""
            if (!userId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);
            const result = await this._foodSpotService.getAllFoodSpotsByFoodie(userId, page, limit, search);
            console.log('result-----my', result);

            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, totalCount: result.totalCount, message: FOODSPOT_MESSAGES.FETCHED_ALL });

        } catch (error) {
            next(error);
        }
    }
    async getRecentFoodSpots(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('here');

            const limit = Number(req.query.limit) || 3;
            const result = await this._foodSpotService.getRecentFoodSpots(limit);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result.data, message: FOODSPOT_MESSAGES.RECENT_FETCHED });
        } catch (error) {
            next(error);
        }
    }

    async toggleSaveFoodSpot(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            const { foodSpotId } = req.body;

            if (!userId) throw new AppError(MESSAGES.USER.USERID_NOTFOUND, STATUS_CODE.UNAUTHORIZED);

            const result = await this._foodSpotService.toggleSaveFoodSpot(userId, foodSpotId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: result.message, isSaved: result.isSaved });
        } catch (error) {
            next(error);
        }
    }

    async getSavedFoodSpots(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 6;

            const result = await this._foodSpotService.getSavedFoodSpots(userId, page, limit);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, currentPage: result.currentPage, totalPages: result.totalPages, message: result.message });
        } catch (error) {
            next(error);
        }
    }
}