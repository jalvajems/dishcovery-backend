import { inject, injectable } from "inversify";
import { IChatService } from "../chat.service.interface";
import { IConversationRepository } from "../../repositories/conversation.repository.interface";
import { IMessageRepository } from "../../repositories/message.repository.interface";
import { IConversation } from "../../models/conversation.model";
import { IMessage } from "../../models/message.model";
import { socketService } from "./socket.service";

@injectable()
export class ChatService implements IChatService {

    constructor(
        @inject('IConversationRepository') private conversationRepository: IConversationRepository,
        @inject('IMessageRepository') private messageRepository: IMessageRepository
    ) { }

    async getOrCreateConversation(
        userId1: string,
        userId2: string,
        role1: 'chef' | 'foodie',
        role2: 'chef' | 'foodie'
    ): Promise<IConversation> {
        return await this.conversationRepository.findOrCreateConversation(userId1, userId2, role1, role2);
    }

    async getUserConversations(userId: string, page: number, limit: number): Promise<{ conversations: any[], total: number }> {
        const { conversations, total } = await this.conversationRepository.getUserConversations(userId, page, limit);

        // Format conversations with other participant info and unread count
        const formattedConversations = conversations.map(conv => {
            const otherParticipant = (conv.participants as any[]).find(
                (p: any) => p._id.toString() !== userId
            );

            // Get role from participantDetails
            const otherParticipantDetails = conv.participantDetails.find(
                (pd: any) => pd.userId.toString() !== userId
            );

            return {
                _id: conv._id,
                otherParticipant: {
                    _id: otherParticipant._id,
                    name: otherParticipant.name,
                    email: otherParticipant.email,
                    role: otherParticipantDetails?.role || 'foodie'
                },
                lastMessage: conv.lastMessage,
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
        senderRole: 'chef' | 'foodie',
        conversationId: string,
        content: string
    ): Promise<IMessage> {
        // Create the message
        const message = await this.messageRepository.createMessage({
            conversationId,
            senderId,
            senderRole,
            content,
            messageType: 'text'
        });

        // Update conversation's last message
        await this.conversationRepository.updateLastMessage(conversationId, (message._id as any).toString());

        // Get conversation to find the recipient
        const conversation = await this.conversationRepository.getConversationById(conversationId);
        if (conversation) {
            const recipientId = (conversation.participants as any[])
                .find((p: any) => p._id.toString() !== senderId)
                ?._id.toString();

            if (recipientId) {
                // Increment unread count for recipient
                await this.conversationRepository.incrementUnreadCount(conversationId, recipientId);

                // EFFECT: Emit to conversation room so both sender and recipient get it
                socketService.emitToRoom(`chat:${conversationId}`, 'chat:message', {
                    conversationId,
                    message
                });

                // Emit conversation update to recipient for their list view
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

        // Get conversation to find the sender
        const conversation = await this.conversationRepository.getConversationById(conversationId);
        if (conversation) {
            const otherUserId = (conversation.participants as any[])
                .find((p: any) => p._id.toString() !== userId)
                ?._id.toString();

            if (otherUserId) {
                // Emit read receipt to the other user
                socketService.emitToRoom(otherUserId, 'chat:messages-read', {
                    conversationId,
                    readBy: userId
                });
                // Also emit to the conversation room so open chat updates
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
            // Updated socket event to generic chat:message-updated with special flags or just chat:message-deleted
            socketService.emitToRoom(`chat:${message.conversationId}`, 'chat:message-deleted', {
                conversationId: message.conversationId,
                messageId: message._id,
                isDeletedForEveryone: true
            });
        }

        return message;
    }

    async markAsDelivered(messageId: string, userId: string): Promise<void> {
        await this.messageRepository.updateMessageStatus(messageId, 'delivered');

        // We need conversation ID to emit. Since messageId is unique, we could fetch it, 
        // but for now let's assume valid flow. 
        // Ideally we would emit to the sender that "this specific message was delivered".
        // Use a broader update for now if we don't have conversation ID handy, 
        // or fetch message to get convo ID.
        // For efficiency, standard flow often has conversationId.
        // Here we silently update status. The sender will see 'delivered' 
        // if they reload or valid socket event is sent.
        // Let's implement a targeted emit if possible.
        // TODO: Targeted emit requires fetching message
    }
}
