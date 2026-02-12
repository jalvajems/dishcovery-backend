import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { INotificationService } from "../interface/INotificationService";
import { INotification } from "../../models/notification.model";
import { socketService } from "./socket.service";

import { Role } from "../../types/user.types";
import { INotificationRepository } from "../../repostories/interface/INotificationRepository";

@injectable()
export class NotificationService implements INotificationService {
    constructor(
        @inject(TYPES.INotificationRepository) private _notificationRepository: INotificationRepository
    ) { }

    async createNotification(
        recipientId: string,
        recipientRole: Role,
        title: string,
        message: string,
        type: 'SESSION_STARTED' | 'SESSION_CANCELLED' | 'WORKSHOP_APPROVED' | 'WORKSHOP_REJECTED',
        workshopId?: string,
        sessionId?: string
    ): Promise<INotification> {
        const notification = await this._notificationRepository.create({
            recipientId: recipientId as any,
            recipientRole,
            title,
            message,
            type,
            workshopId: workshopId as any,
            sessionId: sessionId as any
        });

        socketService.emitToRoom(recipientId, 'notification:new', notification);

        return notification;
    }

    async getUserNotifications(recipientId: string, limit: number = 20, skip: number = 0, filter: string = 'all'): Promise<INotification[]> {
        return await this._notificationRepository.findByRecipient(recipientId, limit, skip, filter);
    }

    async markAsRead(notificationId: string): Promise<INotification | null> {
        return await this._notificationRepository.markAsRead(notificationId);
    }

    async getUnreadCount(recipientId: string): Promise<number> {
        return await this._notificationRepository.countUnread(recipientId);
    }

    async markAllAsRead(recipientId: string): Promise<void> {
        await this._notificationRepository.markAllAsRead(recipientId);
    }

    async deleteAll(recipientId: string): Promise<void> {
        await this._notificationRepository.deleteAll(recipientId);
    }
}
