import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { INotificationController } from "../interface/INotificationController";
import { INotificationService } from "../../services/interfaces/INotificationService";
import { STATUS_CODE } from "../../constants/StatusCode";
import { AppError } from "../../utils/AppError";

@injectable()
export class NotificationController implements INotificationController {
    constructor(
        @inject(TYPES.INotificationService) private _notificationService: INotificationService
    ) { }

    async getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError("Unauthorized", STATUS_CODE.UNAUTHORIZED);

            const limit = Number(req.query.limit) || 20;
            const skip = Number(req.query.skip) || 0;

            const notifications = await this._notificationService.getUserNotifications(userId, limit, skip);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: notifications });
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const notification = await this._notificationService.markAsRead(id);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: notification });
        } catch (error) {
            next(error);
        }
    }

    async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError("Unauthorized", STATUS_CODE.UNAUTHORIZED);

            const count = await this._notificationService.getUnreadCount(userId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: { count } });
        } catch (error) {
            next(error);
        }
    }

    async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError("Unauthorized", STATUS_CODE.UNAUTHORIZED);

            await this._notificationService.markAllAsRead(userId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "All notifications marked as read" });
        } catch (error) {
            next(error);
        }
    }

    async deleteAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError("Unauthorized", STATUS_CODE.UNAUTHORIZED);

            await this._notificationService.deleteAll(userId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: "All notifications deleted" });
        } catch (error) {
            next(error);
        }
    }
}
