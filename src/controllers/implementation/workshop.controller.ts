import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import TYPES from '../../DI/types';
import { IWorkshopController } from '../interface/IWorkshopController';
import { IWorkshopService } from '../../services/interface/IWorkshopService';
import { STATUS_CODE } from '../../constants/StatusCode';
import { AppError } from '../../utils/AppError';
import { MESSAGES, WORKSHOP_MESSAGES } from '../../constants/Message';

@injectable()
export class WorkshopController implements IWorkshopController {
    constructor(
        @inject(TYPES.IWorkshopService) private _workshopService: IWorkshopService
    ) { }

    async createWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId = req.user?.id;
            if (!chefId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);
            const workshop = await this._workshopService.createWorkshop(chefId, req.body);
            res.status(STATUS_CODE.CREATED).json({ success: true, data: workshop, message: WORKSHOP_MESSAGES.CREATED });
        } catch (error) {
            next(error);
        }
    }

    async updateWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId = req.user?.id;
            const { id } = req.params;
            if (!chefId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);
            const workshop = await this._workshopService.updateWorkshop(id, chefId, req.body);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: WORKSHOP_MESSAGES.UPDATED });
        } catch (error) {
            next(error);
        }
    }

    async getWorkshopById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            console.log('getWorkshopById controller - userId:', userId, 'workshopId:', id);
            const workshop = await this._workshopService.getWorkshopById(id, userId);
            
            if (!workshop) throw new AppError('Workshop not found', STATUS_CODE.NOT_FOUND);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: workshop });
        } catch (error) {
            next(error);
        }
    }

    async getChefWorkshops(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('ivden');

            const chefId = req.user?.id;
            if (!chefId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);
            const workshops = await this._workshopService.getChefWorkshops(chefId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: workshops });
        } catch (error) {
            next(error);
        }
    }

    async getAllWorkshops(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const workshops = await this._workshopService.getAllWorkshopsForAdmin();
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: workshops });
        } catch (error) {
            next(error);
        }
    }

    async getApprovedWorkshops(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 6;
            const search = String(req.query.search) || "";
            const filter = String(req.query.filter) || "";
            const userId = req.user?.id; // Optional user ID

            const result = await this._workshopService.getApprovedWorkshops(page, limit, search, filter, userId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.datas, totalCount: result.totalCount });
        } catch (error) {
            next(error);
        }
    }

    async approveWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user?.id;
            const { id } = req.params;
            if (!adminId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);
            const workshop = await this._workshopService.approveWorkshop(id, adminId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: workshop, message: WORKSHOP_MESSAGES.APPROVE });
        } catch (error) {
            next(error);
        }
    }

    async rejectWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const adminId = req.user?.id;
            const { id } = req.params;
            const { rejectionReason } = req.body;
            if (!adminId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);
            const workshop = await this._workshopService.rejectWorkshop(id, adminId, rejectionReason);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: workshop, message:WORKSHOP_MESSAGES.REJECTE });
        } catch (error) {
            next(error);
        }
    }

    async startWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('reached start workshiop ctr');

            const chefId = req.user?.id;
            const { id } = req.params;
            if (!chefId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);
            const workshop = await this._workshopService.startSession(id, chefId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: workshop, message:  WORKSHOP_MESSAGES.SESSION_STARTED});
        } catch (error) {
            next(error);
        }
    }

    async endWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId = req.user?.id;
            const { id } = req.params;
            if (!chefId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);
            const workshop = await this._workshopService.endSession(id, chefId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: workshop, message:WORKSHOP_MESSAGES.SESSION_ENDED });
        } catch (error) {
            next(error);
        }
    }

    async submitWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId = req.user?.id;
            const { id } = req.params;
            if (!chefId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);
            const workshop = await this._workshopService.submitForApproval(id, chefId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: workshop, message: WORKSHOP_MESSAGES.SUBMITTED_FOR_APPROVAL });
        } catch (error) {
            next(error);
        }
    }

    async getWorkshopsByChef(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('ivdethi');

            const chefId = req.user?.id;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 6;
            const search = String(req.query.search) || "";
            const status = String(req.query.status) || "";

            if (!chefId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED)

            const result = await this._workshopService.getWorkshopsByChef(chefId, page, limit, search, status);
            console.log('00workshop',result);

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
    async getWorkshopsByChefToFoodie(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('ivdethi');

            const chefId = String(req.params.chefId) || '';
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 6;
            const search = String(req.query.search) || "";
            const status = String(req.query.status) || "";

            if (!chefId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED)

            const result = await this._workshopService.getWorkshopsByChef(chefId, page, limit, search, status);
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

    async cancelWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId = req.user?.id;
            const { id } = req.params;
            const { reason } = req.body;

            if (!chefId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);
            if (!reason) throw new AppError(WORKSHOP_MESSAGES.CANCEL_REASON_REQUIRED, STATUS_CODE.BAD_REQUEST);

            const workshop = await this._workshopService.cancelWorkshop(id, chefId, reason);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: workshop, message: WORKSHOP_MESSAGES.CANCELLING });
        } catch (error) {
            next(error);
        }
    }
    async getRecentWorkshops(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const limit = Number(req.query.limit) || 3;
            const result = await this._workshopService.getRecentWorkshops(limit);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result.data, message:  WORKSHOP_MESSAGES.RECENT_FETCHED});
        } catch (error) {
            next(error);
        }
    }
}
