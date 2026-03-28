import { Request, Response, NextFunction } from "express";
import { IFoodieController } from "../interface/IFoodieController";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IFoodieService } from "../../services/interface/IFoodieService";
import { STATUS_CODE } from "../../constants/StatusCode";
import { AppError } from "../../utils/AppError";
import { FOODIE_MESSAGES, MESSAGES } from "../../constants/Message";

@injectable()
export class FoodieController implements IFoodieController {

    constructor(
        @inject(TYPES.IFoodieService) private _foodieService: IFoodieService,
    ) { }

    async getFoodieDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('foodiedashboard========')
            const foodieId = req.user?.id;
            if (!foodieId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED)
            const result = await this._foodieService.getProfile(foodieId)
            let hasProfile = true;
            if (!result.data) {
                hasProfile = false
            }
            res.status(STATUS_CODE.SUCCESS).json({ success: true, hasProfile, message:FOODIE_MESSAGES.ENTERED_SUCCESS })
        } catch (error) {
            next(error);
        }
    }

    async getAllRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log('reached controller');
        console.log('reached fr cntrlr');
        try {
            const result = await this._foodieService.getAllRecipes();
            res.status(STATUS_CODE.SUCCESS).json({ success: true, recipeData: result.data, message: result.message })
        } catch (error) {
            next(error);
        }
    }
    async getRecipeDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const userId = req.user?.id;
            const recipeId = req.params.id;

            if (!recipeId) throw new AppError(FOODIE_MESSAGES.RECIPEID_NOTFOUND, STATUS_CODE.NOT_FOUND);
            if (!userId) throw new AppError(FOODIE_MESSAGES.USERID_NOTFOUND, STATUS_CODE.UNAUTHORIZED);
            const result = await this._foodieService.getRecipeDetail(recipeId, userId);
            console.log('recipedetail=========', result);

            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, isSaved: result.isSaved, message: result.message })

        } catch (error) {
            next(error);
        }
    }

    async createProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id
            const data = req.body;
            if (!userId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED)
            const result = await this._foodieService.createProfile(userId, data)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result, message: FOODIE_MESSAGES.PROFILE_CREATED })
        } catch (error) {
            next(error)
        }
    }
    async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError("user not authorized", STATUS_CODE.UNAUTHORIZED)
            await this._foodieService.updateProfile(userId, req.body);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: FOODIE_MESSAGES.PROFILE_UPDATED })
        } catch (error) {
            next(error);
        }
    }
    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id
            if (!userId) throw new AppError("user not authorized", STATUS_CODE.UNAUTHORIZED)
            const result = await this._foodieService.getProfile(userId)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result, message:FOODIE_MESSAGES.DATA_FETCHED })
        } catch (error) {
            next(error)
        }
    }
}