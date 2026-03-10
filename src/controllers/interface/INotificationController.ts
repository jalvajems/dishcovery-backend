import { Request, Response, NextFunction } from "express";

export interface INotificationController {
    getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void>;
    markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    deleteAll(req: Request, res: Response, next: NextFunction): Promise<void>;
}
