import { IConversation } from "../models/conversation.model";
import { IMessage } from "../models/message.model";

export interface IChatService {
    getOrCreateConversation(userId1: string, userId2: string, role1: 'chef' | 'foodie', role2: 'chef' | 'foodie'): Promise<IConversation>;
    getUserConversations(userId: string, page: number, limit: number): Promise<{ conversations: any[], total: number }>;
    sendMessage(senderId: string, senderRole: 'chef' | 'foodie', conversationId: string, content: string): Promise<IMessage>;
    getMessages(conversationId: string, userId: string, page: number, limit: number): Promise<{ messages: IMessage[], total: number }>;
    markAsRead(conversationId: string, userId: string): Promise<void>;
    deleteMessage(messageId: string, userId: string, forEveryone: boolean): Promise<IMessage | null>;
    markAsDelivered(messageId: string, userId: string): Promise<void>;
}
