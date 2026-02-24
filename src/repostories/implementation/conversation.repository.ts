import { Role } from "../../types/user.types";
import { injectable } from "inversify";
import { Conversation } from "../../models/conversation.model";
import { IConversationRepository } from "../interface/conversation.repository.interface";
import { IPopulatedConversation } from "../../dtos/chat.dtos";
import mongoose from "mongoose";

@injectable()
export class ConversationRepository implements IConversationRepository {

    async findOrCreateConversation(
        userId1: string,
        userId2: string,
        role1: Role,
        role2: Role
    ): Promise<IPopulatedConversation> {
        const participantIds = [
            new mongoose.Types.ObjectId(userId1),
            new mongoose.Types.ObjectId(userId2)
        ].sort((a, b) => a.toString().localeCompare(b.toString()));

        let conversation = await Conversation.findOne({
            participants: { $all: participantIds }
        }).populate('participants', 'name email');

        if (!conversation) {
            const newConversation = await Conversation.create({
                participants: participantIds,
                participantDetails: [
                    { userId: new mongoose.Types.ObjectId(userId1), role: role1 },
                    { userId: new mongoose.Types.ObjectId(userId2), role: role2 }
                ],
                unreadCount: new Map([
                    [userId1, 0],
                    [userId2, 0]
                ])
            });

            conversation = await newConversation.populate('participants', 'name email');
        }

        return conversation as unknown as IPopulatedConversation;
    }

    async getConversationById(conversationId: string): Promise<IPopulatedConversation | null> {
        const conversation = await Conversation.findById(conversationId)
            .populate('participants', 'name email')
            .populate('lastMessage');

        return conversation as unknown as IPopulatedConversation | null;
    }

    async getUserConversations(userId: string, page: number, limit: number): Promise<{ conversations: IPopulatedConversation[], total: number }> {
        const skip = (page - 1) * limit;

        const conversations = await Conversation.find({
            participants: new mongoose.Types.ObjectId(userId)
        })
            .populate('participants', 'name email')
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Conversation.countDocuments({
            participants: new mongoose.Types.ObjectId(userId)
        });

        return { conversations: conversations as unknown as IPopulatedConversation[], total };
    }

    async updateLastMessage(conversationId: string, messageId: string): Promise<void> {
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: new mongoose.Types.ObjectId(messageId),
            lastMessageAt: new Date()
        });
    }

    async incrementUnreadCount(conversationId: string, userId: string): Promise<void> {
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
            const currentCount = conversation.unreadCount.get(userId) || 0;
            conversation.unreadCount.set(userId, currentCount + 1);
            await conversation.save();
        }
    }

    async resetUnreadCount(conversationId: string, userId: string): Promise<void> {
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
            conversation.unreadCount.set(userId, 0);
            await conversation.save();
        }
    }
}
