import mongoose, { Schema, Document } from 'mongoose';
import { Role } from '../types/user.types';

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    senderRole: Role;
    content: string;
    fileUrl?: string;
    messageType: 'text' | 'image' | 'video' | 'audio' | 'file';
    status: 'sent' | 'delivered' | 'read';
    readBy: mongoose.Types.ObjectId[];
    deletedFor: mongoose.Types.ObjectId[];
    isDeletedForEveryone: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        senderRole: {
            type: String,
            enum: ['chef', 'foodie'],
            required: true
        },
        content: {
            type: String,
            required: false, // Content can be empty if it's just a file
            trim: true
        },
        fileUrl: {
            type: String,
            required: false
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'video', 'audio', 'file'],
            default: 'text'
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'read'],
            default: 'sent'
        },
        readBy: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        deletedFor: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        isDeletedForEveryone: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Compound index for efficient conversation message queries with pagination
MessageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
