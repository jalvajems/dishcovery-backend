import { IConversation } from "../models/conversation.model";
import { IPopulatedConversation } from "../dtos/chat.dtos";
import mongoose from "mongoose";
import { Role } from "../types/user.types";

export interface IConversationRepository {
    findOrCreateConversation(userId1: string, userId2: string, role1: Role, role2: Role): Promise<IPopulatedConversation>;
    getConversationById(conversationId: string): Promise<IPopulatedConversation | null>;
    getUserConversations(userId: string, page: number, limit: number): Promise<{ conversations: IPopulatedConversation[], total: number }>;
    updateLastMessage(conversationId: string, messageId: string): Promise<void>;
    incrementUnreadCount(conversationId: string, userId: string): Promise<void>;
    resetUnreadCount(conversationId: string, userId: string): Promise<void>;
}
