import { Request, Response, NextFunction } from "express";
import { IChefController } from "../interface/IChefController";
import { STATUS_CODE } from "../../constants/StatusCode";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IChefService } from "../../services/interface/IChefService";
import { success } from "zod";
import { AppError } from "../../utils/AppError";

@injectable()
export class ChefController implements IChefController {

    constructor(
        @inject(TYPES.IChefService) private _chefService: IChefService,

    ) { }

    async getChefDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        const id = req.user?.id
        if (!id) throw new AppError('user is not authenticated', STATUS_CODE.UNAUTHORIZED)
        const result = await this._chefService.getProfile(id)
        const user = await this._chefService.getUser(id)

        console.log('user in dashbord chef', user);

        let hasProfile = true

        if (!result.data) {
            hasProfile = false
        }
        console.log('result in controller', result);

        console.log('profile', result)
        res.status(STATUS_CODE.SUCCESS).json({ success: true, hasProfile, isVerified: user.data?.isVerified ?? false, message: 'entered in to chef dashboard' })
    }
    async createProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId = req.user?.id;
            const payload = req.body;

            console.log('data===', payload);


            if (!chefId) throw new AppError('no chef id  found', STATUS_CODE.UNAUTHORIZED)
            const result = await this._chefService.createProfile(chefId, payload)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result.data, message: 'Profile created successfully' })
        } catch (error) {
            next(error)
        }
    }
    async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const chefId = req.user?.id;
            const payload = req.body;
            console.log('reaaaaaach=======================', payload);
            if (!chefId) throw new AppError("not authenticated", STATUS_CODE.UNAUTHORIZED)
            const result = await this._chefService.updateProfile(chefId as string, payload)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result, message: "Profie data updated!!" })
        } catch (error) {
            next(error)

        }
    }
    async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId = req.user?.id
            console.log('userid', chefId);

            if (!chefId) throw new AppError("user is not authorized", STATUS_CODE.UNAUTHORIZED)
            const result = await this._chefService.getProfile(chefId);

            console.log('profile========0', result);

            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result.data, reviews: result.reviews, message: "data fetched successfully" })
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