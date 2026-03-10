import { IPopulatedConversation, IConversationDto, IMessageDto } from "../../dtos/chat.dtos";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IMessage } from "../../models/message.model";
import { Role } from "../../types/user.types";

export interface IChatService {
    getOrCreateConversation(userId1: string, userId2: string, role1: Role, role2: Role): Promise<IPopulatedConversation>;
    getUserConversations(userId: string, page: number, limit: number): Promise<{ conversations: IConversationDto[], total: number }>;
    sendMessage(senderId: string, senderRole: Role, conversationId: string, content: string, fileUrl?: string, messageType?: 'text' | 'image' | 'video' | 'audio' | 'file'): Promise<IMessageDto>;
    getMessages(conversationId: string, userId: string, page: number, limit: number): Promise<{ messages: IMessageDto[], total: number }>;
    markAsRead(conversationId: string, userId: string): Promise<void>;
    deleteMessage(messageId: string, userId: string, forEveryone: boolean): Promise<IMessageDto | null>;
    markAsDelivered(messageId: string): Promise<void>;
}
