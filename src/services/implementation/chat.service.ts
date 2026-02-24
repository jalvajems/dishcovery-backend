import { inject, injectable } from "inversify";
import { IChatService } from "../interface/chat.service.interface";
import { IConversationRepository } from "../../repostories/interface/conversation.repository.interface";
import { IMessageRepository } from "../../repostories/interface/message.repository.interface";
import { IMessage } from "../../models/message.model";
import { socketService } from "./socket.service";
import { Role } from "../../types/user.types";
import { IPopulatedConversation, IConversationDto, IPopulatedParticipant } from "../../dtos/chat.dtos";
import { Types } from "mongoose";

@injectable()
export class ChatService implements IChatService {

    constructor(
        @inject('IConversationRepository') private conversationRepository: IConversationRepository,
        @inject('IMessageRepository') private messageRepository: IMessageRepository
    ) { }

    async getOrCreateConversation(
        userId1: string,
        userId2: string,
        role1: Role,
        role2: Role
    ): Promise<IPopulatedConversation> {
        return await this.conversationRepository.findOrCreateConversation(userId1, userId2, role1, role2);
    }

    async getUserConversations(userId: string, page: number, limit: number): Promise<{ conversations: IConversationDto[], total: number }> {
        const { conversations, total } = await this.conversationRepository.getUserConversations(userId, page, limit);

        const formattedConversations: IConversationDto[] = conversations.map(conv => {
            const participants = conv.participants as unknown as IPopulatedParticipant[];
            const otherParticipant = participants.find(
                (p) => p._id.toString() !== userId
            )!;

            const otherParticipantDetails = conv.participantDetails.find(
                (pd) => pd.userId.toString() !== userId
            );

            return {
                _id: conv._id as Types.ObjectId,
                otherParticipant: {
                    _id: otherParticipant._id,
                    name: otherParticipant.name,
                    email: otherParticipant.email,
                    role: otherParticipantDetails?.role || Role.FOODIE
                },
                lastMessage: conv.lastMessage as unknown as IMessage | undefined,
                lastMessageAt: conv.lastMessageAt,
                unreadCount: conv.unreadCount.get(userId) || 0,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt
            };
        });

        return { conversations: formattedConversations, total };
    }

    async sendMessage(
        senderId: string,
        senderRole: Role,
        conversationId: string,
        content: string,
        fileUrl?: string,
        messageType: 'text' | 'image' | 'video' | 'audio' | 'file' = 'text'
    ): Promise<IMessage> {
        const message = await this.messageRepository.createMessage({
            conversationId,
            senderId,
            senderRole,
            content,
            fileUrl,
            messageType
        });

        await this.conversationRepository.updateLastMessage(conversationId, (message._id as Types.ObjectId).toString());

        const conversation = await this.conversationRepository.getConversationById(conversationId);
        if (conversation) {
            const participants = conversation.participants as unknown as IPopulatedParticipant[];
            const recipientId = participants
                .find((p) => p._id.toString() !== senderId)
                ?._id.toString();

            if (recipientId) {
                await this.conversationRepository.incrementUnreadCount(conversationId, recipientId);

                socketService.emitToRoom(`chat:${conversationId}`, 'chat:message', {
                    conversationId,
                    message
                });

                socketService.emitToRoom(recipientId, 'chat:conversation-update', {
                    conversationId,
                    lastMessage: message,
                    lastMessageAt: new Date()
                });
            }
        }

        return message;
    }

    async getMessages(
        conversationId: string,
        userId: string,
        page: number,
        limit: number
    ): Promise<{ messages: IMessage[], total: number }> {
        return await this.messageRepository.getMessagesByConversation(conversationId, page, limit);
    }

    async markAsRead(conversationId: string, userId: string): Promise<void> {
        await this.messageRepository.markMessagesAsRead(conversationId, userId);
        await this.conversationRepository.resetUnreadCount(conversationId, userId);

        const conversation = await this.conversationRepository.getConversationById(conversationId);
        if (conversation) {
            const participants = conversation.participants as unknown as IPopulatedParticipant[];
            const otherUserId = participants
                .find((p) => p._id.toString() !== userId)
                ?._id.toString();

            if (otherUserId) {
                socketService.emitToRoom(otherUserId, 'chat:messages-read', {
                    conversationId,
                    readBy: userId
                });
                socketService.emitToRoom(`chat:${conversationId}`, 'chat:messages-read', {
                    conversationId,
                    readBy: userId
                });
            }
        }
    }

    async deleteMessage(messageId: string, userId: string, forEveryone: boolean): Promise<IMessage | null> {
        const message = await this.messageRepository.deleteMessage(messageId, userId, forEveryone);

        if (message && forEveryone) {
            socketService.emitToRoom(`chat:${message.conversationId}`, 'chat:message-deleted', {
                conversationId: message.conversationId,
                messageId: message._id,
                isDeletedForEveryone: true
            });
        }

        return message;
    }

    async markAsDelivered(messageId: string): Promise<void> {
        await this.messageRepository.updateMessageStatus(messageId, 'delivered');


    }
}
