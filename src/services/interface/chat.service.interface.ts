import { IConversation } from "../../models/conversation.model";
import { IMessage } from "../../models/message.model";
import { Role } from "../../types/user.types";

export interface IChatService {
    getOrCreateConversation(userId1: string, userId2: string, role1: Role, role2: Role): Promise<IConversation>;
    getUserConversations(userId: string, page: number, limit: number): Promise<{ conversations: any[], total: number }>;
    sendMessage(senderId: string, senderRole: Role, conversationId: string, content: string, fileUrl?: string, messageType?: 'text' | 'image' | 'video' | 'audio' | 'file'): Promise<IMessage>;
    getMessages(conversationId: string, userId: string, page: number, limit: number): Promise<{ messages: IMessage[], total: number }>;
    markAsRead(conversationId: string, userId: string): Promise<void>;
    deleteMessage(messageId: string, userId: string, forEveryone: boolean): Promise<IMessage | null>;
    markAsDelivered(messageId: string, userId: string): Promise<void>;
}
