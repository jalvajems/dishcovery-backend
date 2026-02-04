import { IMessage } from "../models/message.model";

export interface IMessageRepository {
    createMessage(messageData: {
        conversationId: string;
        senderId: string;
        senderRole: 'chef' | 'foodie';
        content: string;
        messageType?: 'text' | 'image';
    }): Promise<IMessage>;
    getMessagesByConversation(conversationId: string, page: number, limit: number): Promise<{ messages: IMessage[], total: number }>;
    updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'read'): Promise<void>;
    markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
    getUnreadMessageCount(conversationId: string, userId: string): Promise<number>;
    deleteMessage(messageId: string, userId: string, forEveryone: boolean): Promise<IMessage | null>;
}
