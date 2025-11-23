import { Request, Response, NextFunction } from "express";
import { IFoodieDto } from "../../dtos/foodie.dtos";
import { IFoodieController } from "../interface/IFoodieController";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IFoodieService } from "../../services/interface/IFoodieService";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { log } from "../../utils/logger";

@injectable()
export class FoodieController implements IFoodieController {

    constructor(
        @inject(TYPES.IFoodieService) private _foodieService: IFoodieService,
    ) { }

    async getFoodieDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.status(STATUS_CODE.SUCCESS).json({ message: 'Entered into foodie dashboard!!' })
        } catch (error) {
            next(error);
        }
    }
    async editFoodieProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new Error('userId is not found');
            }
            const foodieData = req.body;
            const result = await this._foodieService.editFoodieProfile(userId, foodieData)
            res.status(STATUS_CODE.SUCCESS).json('profile updated successfully')

        } catch (error) {
            next(error);
        }
    }
}