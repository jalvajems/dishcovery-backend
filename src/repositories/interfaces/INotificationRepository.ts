import { INotification } from "../../models/notification.model";

export interface INotificationRepository {
    create(notification: Partial<INotification>): Promise<INotification>;
    findByRecipient(recipientId: string, limit?: number, skip?: number): Promise<INotification[]>;
    markAsRead(notificationId: string): Promise<INotification | null>;
    countUnread(recipientId: string): Promise<number>;
    markAllAsRead(recipientId: string): Promise<void>;
    deleteAll(recipientId: string): Promise<void>;
}
