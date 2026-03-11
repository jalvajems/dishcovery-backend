import { injectable } from "inversify";
import { FilterQuery } from "mongoose";
import { INotification, NotificationModel } from "../../models/notification.model";
import { INotificationRepository } from "../interface/INotificationRepository";

@injectable()
export class NotificationRepository implements INotificationRepository {

    async create(notification: Partial<INotification>): Promise<INotification> {
        return await NotificationModel.create(notification);
    }

    async findByRecipient(recipientId: string, limit: number = 20, skip: number = 0, filter: string = 'all'): Promise<INotification[]> {
        const query: FilterQuery<INotification> = { recipientId };

        if (filter === 'unread') {
            query.isRead = false;
        } else if (filter === 'read') {
            query.isRead = true;
        }

        return await NotificationModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    async markAsRead(notificationId: string): Promise<INotification | null> {
        return await NotificationModel.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        ).exec();
    }

    async countUnread(recipientId: string): Promise<number> {
        return await NotificationModel.countDocuments({
            recipientId,
            isRead: false
        }).exec();
    }

    async markAllAsRead(recipientId: string): Promise<void> {
        await NotificationModel.updateMany(
            { recipientId, isRead: false },
            { isRead: true }
        ).exec();
    }

    async deleteAll(recipientId: string, filter: string = 'all'): Promise<void> {
        const query: FilterQuery<INotification> = { recipientId };

        if (filter === 'unread') {
            query.isRead = false;
        } else if (filter === 'read') {
            query.isRead = true;
        }

        await NotificationModel.deleteMany(query).exec();
    }
}
