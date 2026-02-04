import { IConversation } from "../models/conversation.model";
import mongoose from "mongoose";

export interface IConversationRepository {
    findOrCreateConversation(userId1: string, userId2: string, role1: 'chef' | 'foodie', role2: 'chef' | 'foodie'): Promise<IConversation>;
    getConversationById(conversationId: string): Promise<IConversation | null>;
    getUserConversations(userId: string, page: number, limit: number): Promise<{ conversations: IConversation[], total: number }>;
    updateLastMessage(conversationId: string, messageId: string): Promise<void>;
    incrementUnreadCount(conversationId: string, userId: string): Promise<void>;
    resetUnreadCount(conversationId: string, userId: string): Promise<void>;
}
