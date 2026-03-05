import { INotification } from "../../models/notification.model";
import { Role } from "../../types/user.types";
import { INotificationDto } from "../../dtos/notification.dtos";

export interface INotificationService {
    createNotification(recipientId: string, recipientRole: Role, title: string, message: string, type: 'SESSION_STARTED' | 'SESSION_CANCELLED' | 'WORKSHOP_APPROVED' | 'WORKSHOP_REJECTED' | 'WORKSHOP_EXPIRED', workshopId?: string, sessionId?: string): Promise<INotificationDto>;
    getUserNotifications(recipientId: string, limit?: number, skip?: number, filter?: string): Promise<INotificationDto[]>;
    markAsRead(notificationId: string): Promise<INotificationDto | null>;
    getUnreadCount(recipientId: string): Promise<number>;
    markAllAsRead(recipientId: string): Promise<void>;
    deleteAll(recipientId: string): Promise<void>;
}
