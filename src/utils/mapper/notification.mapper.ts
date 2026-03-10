import { INotificationDto } from "../../dtos/notification.dtos";
import { INotification } from "../../models/notification.model";

export function notificationMapper(notification: INotification): INotificationDto {
    const obj = notification.toObject ? notification.toObject() : notification;
    return {
        id: (obj._id || obj.id).toString(),
        recipientId: obj.recipientId.toString(),
        recipientRole: obj.recipientRole,
        title: obj.title,
        message: obj.message,
        type: obj.type,
        workshopId: obj.workshopId?.toString(),
        sessionId: obj.sessionId?.toString(),
        isRead: obj.isRead,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    };
}

export function allNotificationsMapper(notifications: INotification[]): INotificationDto[] {
    return notifications.map(notification => notificationMapper(notification));
}
