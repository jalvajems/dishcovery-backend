import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    participantDetails: {
        userId: mongoose.Types.ObjectId;
        role: 'chef' | 'foodie';
    }[];
    lastMessage?: mongoose.Types.ObjectId;
    lastMessageAt: Date;
    unreadCount: Map<string, number>;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
    {
        participants: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],
        participantDetails: [{
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            role: {
                type: String,
                enum: ['chef', 'foodie'],
                required: true
            }
        }],
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message'
        },
        lastMessageAt: {
            type: Date,
            default: Date.now
        },
        unreadCount: {
            type: Map,
            of: Number,
            default: new Map()
        }
    },
    {
        timestamps: true
    }
);

// Compound index for efficient participant queries
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

// Ensure only two participants per conversation
ConversationSchema.pre('save', function (next) {
    if (this.participants.length !== 2) {
        next(new Error('A conversation must have exactly 2 participants'));
    }
    next();
});

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
