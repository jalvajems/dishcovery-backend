import { inject, injectable } from "inversify";
import mongoose from "mongoose";
import TYPES from "../../DI/types";
import { INotificationService } from "../interface/INotificationService";
import { INotification } from "../../models/notification.model";
import { socketService } from "./socket.service";

import { Role } from "../../types/user.types";
import { INotificationRepository } from "../../repostories/interface/INotificationRepository";
import { INotificationDto } from "../../dtos/notification.dtos";
import { notificationMapper, allNotificationsMapper } from "../../utils/mapper/notification.mapper";

@injectable()
export class NotificationService implements INotificationService {
    constructor(
        @inject(TYPES.INotificationRepository) private _notificationRepository: INotificationRepository
    ) { }

    async createNotification(
        recipientId: string,
        recipientRole: Role.CHEF | Role.FOODIE,
        title: string,
        message: string,
        type: 'SESSION_STARTED' | 'SESSION_CANCELLED' | 'WORKSHOP_APPROVED' | 'WORKSHOP_REJECTED' | 'WORKSHOP_EXPIRED',
        workshopId?: string,
        sessionId?: string
    ): Promise<INotificationDto> {
        const payload: Partial<INotification> = {
            recipientId: new mongoose.Types.ObjectId(recipientId) as unknown as mongoose.Types.ObjectId,
            recipientRole,
            title,
            message,
            type
        };

        if (workshopId) payload.workshopId = new mongoose.Types.ObjectId(workshopId);
        if (sessionId) payload.sessionId = new mongoose.Types.ObjectId(sessionId);

        const notification = await this._notificationRepository.create(payload);

        socketService.emitToRoom(recipientId, 'notification:new', notification);

        return notificationMapper(notification);
    }

    async getUserNotifications(recipientId: string, limit: number = 20, skip: number = 0, filter: string = 'all'): Promise<INotificationDto[]> {
        const notifications = await this._notificationRepository.findByRecipient(recipientId, limit, skip, filter);
        return allNotificationsMapper(notifications);
    }

    async markAsRead(notificationId: string): Promise<INotificationDto | null> {
        const notification = await this._notificationRepository.markAsRead(notificationId);
        return notification ? notificationMapper(notification) : null;
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
