export interface INotificationDto {
    id: string;
    recipientId: string;
    recipientRole: string;
    title: string;
    message: string;
    type: 'SESSION_STARTED' | 'SESSION_CANCELLED' | 'WORKSHOP_APPROVED' | 'WORKSHOP_REJECTED' | 'WORKSHOP_EXPIRED';
    workshopId?: string;
    sessionId?: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}
