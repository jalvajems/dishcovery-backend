import { Request, Response, NextFunction } from "express";
import { IChefController } from "../interface/IChefController";
import { STATUS_CODE } from "../../constants/StatusCode";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IChefService } from "../../services/interface/IChefService";
import { AppError } from "../../utils/AppError";
import { CHEF_MESSAGES, MESSAGES } from "../../constants/Message";

@injectable()
export class ChefController implements IChefController {

    constructor(
        @inject(TYPES.IChefService) private _chefService: IChefService,

    ) { }

    async getChefDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId = req.user?.id;
            if (!chefId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);
            const result = await this._chefService.getProfile(chefId);
            const user = await this._chefService.getUser(chefId);

            console.log('user in dashbord chef', user);

            let hasProfile = true;

            if (!result.data) {
                hasProfile = false;
            }

            const stats = await this._chefService.getDashboardStats(chefId);

            console.log('profile', result);
            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                hasProfile,
                isVerified: user.data?.isVerified ?? false,
                stats,
                message:CHEF_MESSAGES.ENTERED_TO_CHEF_DASHBOARD
            });
        } catch (error) {
            next(error);
        }
    }
    async createProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId = req.user?.id;
            const payload = req.body;

            console.log('data===', payload);


            if (!chefId) throw new AppError(MESSAGES.NOT_FOUND, STATUS_CODE.UNAUTHORIZED)
            const result = await this._chefService.createProfile(chefId, payload)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result.data, message:CHEF_MESSAGES.PROFILE_CREATED })
        } catch (error) {
            next(error)
        }
    }
    async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const chefId = req.user?.id;
            const payload = req.body;
            console.log('reaaaaaach=======================', payload);
            if (!chefId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED)
            const result = await this._chefService.updateProfile(chefId as string, payload)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result, message: CHEF_MESSAGES.PROFILE_UPDATED })
        } catch (error) {
            next(error)

        }
    }
    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId = req.user?.id
            console.log('userid', chefId);

            if (!chefId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED)
            const result = await this._chefService.getProfile(chefId);

            console.log('profile========0', result);

            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result.data, reviews: result.reviews, message:CHEF_MESSAGES.DATA_FETCHED  })
        } catch (error) {
            next(error)
        }
    }

    async getAllChefs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 6;
            const search = String(req.query.search) || "";
            const filter = String(req.query.filter) || "";
            const result = await this._chefService.getAllChefs(page, limit, search, filter);
            console.log('result in all chef....', result);

            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                datas: result.datas,
                totalCount: result.totalCount,
                currentPage: page,
                totalPages: Math.ceil(result.totalCount / limit)
            });
        } catch (error) {
            next(error);
        }
    }

    async getChefDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const result = await this._chefService.getChefDetails(id);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data });
        } catch (error) {
            next(error);
        }
    }
}