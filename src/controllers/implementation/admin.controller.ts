import { Request, Response, NextFunction } from "express";
import { IAdminController } from "../interface/IAdminController";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IAdminService } from "../../services/interface/IAdminService";
import { STATUS_CODE } from "../../constants/StatusCode";
import { MESSAGES } from "../../constants/Message";

@injectable()
export class AdminController implements IAdminController {
    constructor(
        @inject(TYPES.IAdminService) private _adminService: IAdminService,
    ) { }
    async getAllFoodies(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) ||                   10;
            const search = (req.query.search as string) || "";
            const isBlocked = req.query.isBlocked as string;

            const result = await this._adminService.getAllFoodies({
                page, limit, search, isBlocked,
            })

            res.status(STATUS_CODE.SUCCESS).json(result)
        } catch (error) {
            next(error)
        }
    }
    async getAllChefs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = (req.query.search as string) || "";
            const isBlocked = req.query.isBlocked as string;
            const isVerified = req.query.isVerified as string;
            const result = await this._adminService.getAllChefs({
                page, limit, search, isBlocked, isVerified
            })
            res.status(STATUS_CODE.SUCCESS).json(result)
        } catch (error) {
            next(error);
        }
    }
    async blockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;

            const restult = await this._adminService.blockUserById(userId)
            res.status(STATUS_CODE.SUCCESS).json({ restult })
        } catch (error) {
            next(error);
        }
    }
    async unBlockUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            const restult = await this._adminService.unBlockUserById(userId)
            res.status(STATUS_CODE.SUCCESS).json({ restult })
        } catch (error) {
            next(error)
        }
    }
    async verifyChef(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId = req.params.id;
            const result = await this._adminService.verifyChef(chefId);
            res.status(STATUS_CODE.SUCCESS).json({ result });
        } catch (error) {
            next(error);
        }
    }
    async unVerifyChef(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId = req.params.id;
            const result = await this._adminService.unVerifyChef(chefId);
            res.status(STATUS_CODE.SUCCESS).json({ result });
        } catch (error) {
            next(error);
        }
    }
    async getAllRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = (req.query.search as string) || "";
            const isBlocked = req.query.isBlocked as string;

            const result = await this._adminService.getAllRecipes({ page, limit, search, isBlocked })
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, currentPage: result.currentPage, totalPages: result.totalPages })

        } catch (error) {
            next(error);
        }
    }
    async blockRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const recipeId = req.params.id
            await this._adminService.blockRecipe(recipeId)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: MESSAGES.BLOCK_UPDATED })
        } catch (error) {
            next(error)
        }
    }
    async unBlockRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const recipeId = req.params.id;
            await this._adminService.unblockRecipe(recipeId)
            res.status(STATUS_CODE.SUCCESS).json()
        } catch (error) {
            next(error)
        }
    }
    async getAllBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('reach');

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = (req.query.search as string) || "";
            const isBlocked = req.query.isBlocked as string;

            const result = await this._adminService.getAllBlogs({ page, limit, search, isBlocked })
            console.log('reslt=-==', result);

            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, currentPage: result.currentPage, totalPages: result.totalPages })
        } catch (error) {
            next(error)
        }
    }
    async blockBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const blogId = req.params.id;
            await this._adminService.blockBlog(blogId)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: MESSAGES.BLOCK_UPDATED })
        } catch (error) {
            next(error)
        }
    }
    async unBlockBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const blogId = req.params.id;
            await this._adminService.unblockBlog(blogId)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: MESSAGES.BLOCK_UPDATED })
        } catch (error) {
            next(error)
        }
    }
    async getAllFoodSpots(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = (req.query.search as string) || "";
            const isBlocked = req.query.isBlocked as string;
            const isApproved = req.query.isApproved as string;

            const result = await this._adminService.getAllFoodSpot({ page, limit, search, isApproved, isBlocked })
            console.log('====controler', result);

            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, currentPage: result.currentPage, totalPages: result.totalPages })

        } catch (error) {
            next(error)
        }
    }
    async blockSpot(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const spotId = req.params.id;
            await this._adminService.blockSpot(spotId)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: MESSAGES.BLOCK_UPDATED })
        } catch (error) {
            next(error)
        }
    }
    async unblockSpot(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const spotId = req.params.id;
            await this._adminService.unblockSpot(spotId)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: MESSAGES.BLOCK_UPDATED })
        } catch (error) {
            next(error)
        }
    }
    async approveSpot(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const spotId = req.params.id;
            await this._adminService.approveSpot(spotId)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: MESSAGES.APPROVE_UPDATED })
        } catch (error) {
            next(error)
        }
    }
    async unApproveSpot(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const spotId = req.params.id;
            await this._adminService.unapproveSpot(spotId)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: MESSAGES.APPROVE_UPDATED })
        } catch (error) {
            next(error)
        }
    }
    async getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const stats = await this._adminService.getDashboardStats();
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: stats });
        } catch (error) {
            next(error);
        }
    }
    async getGrowthData(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const growthData = await this._adminService.getGrowthData();
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: growthData });
        } catch (error) {
            next(error);
        }
    }
}
