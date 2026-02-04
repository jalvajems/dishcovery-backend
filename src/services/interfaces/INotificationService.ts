import { INotification } from "../../models/notification.model";

export interface INotificationService {
    createNotification(recipientId: string, recipientRole: 'chef' | 'foodie', title: string, message: string, type: string, workshopId?: string, sessionId?: string): Promise<INotification>;
    getUserNotifications(recipientId: string, limit?: number, skip?: number, filter?: string): Promise<INotification[]>;
    markAsRead(notificationId: string): Promise<INotification | null>;
    getUnreadCount(recipientId: string): Promise<number>;
    markAllAsRead(recipientId: string): Promise<void>;
    deleteAll(recipientId: string): Promise<void>;
}
