import { injectable } from "inversify";
import { Message, IMessage } from "../models/message.model";
import { IMessageRepository } from "../repositories/message.repository.interface";
import mongoose from "mongoose";

@injectable()
export class MessageRepository implements IMessageRepository {

    async createMessage(messageData: {
        conversationId: string;
        senderId: string;
        senderRole: 'chef' | 'foodie';
        content: string;
        messageType?: 'text' | 'image';
    }): Promise<IMessage> {
        const message = await Message.create({
            conversationId: new mongoose.Types.ObjectId(messageData.conversationId),
            senderId: new mongoose.Types.ObjectId(messageData.senderId),
            senderRole: messageData.senderRole,
            content: messageData.content,
            messageType: messageData.messageType || 'text',
            status: 'sent'
        });

        return await message.populate('senderId', 'name email profileImage role');
    }

    async getMessagesByConversation(
        conversationId: string,
        page: number,
        limit: number
    ): Promise<{ messages: IMessage[], total: number }> {
        const skip = (page - 1) * limit;

        const messages = await Message.find({
            conversationId: new mongoose.Types.ObjectId(conversationId)
        })
            .populate('senderId', 'name email profileImage role')
            .sort({ createdAt: -1 }) // Most recent first for pagination
            .skip(skip)
            .limit(limit);

        const total = await Message.countDocuments({
            conversationId: new mongoose.Types.ObjectId(conversationId)
        });

        return { messages: messages.reverse(), total }; // Reverse to show oldest first in UI
    }

    async updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'read'): Promise<void> {
        await Message.findByIdAndUpdate(messageId, { status });
    }

    async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
        await Message.updateMany(
            {
                conversationId: new mongoose.Types.ObjectId(conversationId),
                senderId: { $ne: new mongoose.Types.ObjectId(userId) },
                status: { $ne: 'read' }
            },
            {
                $set: { status: 'read' },
                $addToSet: { readBy: new mongoose.Types.ObjectId(userId) }
            }
        );
    }

    async getUnreadMessageCount(conversationId: string, userId: string): Promise<number> {
        return await Message.countDocuments({
            conversationId: new mongoose.Types.ObjectId(conversationId),
            senderId: { $ne: new mongoose.Types.ObjectId(userId) },
            status: { $ne: 'read' }
        });
    }

    async deleteMessage(messageId: string, userId: string, forEveryone: boolean): Promise<IMessage | null> {
        if (forEveryone) {
            return await Message.findOneAndUpdate(
                { _id: messageId, senderId: userId }, // Can only delete everyone if sender
                { isDeletedForEveryone: true },
                { new: true }
            );
        } else {
            return await Message.findByIdAndUpdate(
                messageId,
                { $addToSet: { deletedFor: userId } },
                { new: true }
            );
        }
    }
}
