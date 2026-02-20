import { IConversation } from "../models/conversation.model";
import { Types } from "mongoose";
import { IMessage } from "../models/message.model";

export interface IPopulatedParticipant {
    _id: Types.ObjectId;
    name: string;
    email: string;
}

export interface IPopulatedConversation extends Omit<IConversation, 'participants' | 'lastMessage'> {
    participants: IPopulatedParticipant[];
    lastMessage?: IMessage;
}

export interface IParticipantDto {
    _id: Types.ObjectId;
    name: string;
    email: string;
    role: string;
}

export interface IConversationDto {
    _id: Types.ObjectId;
    otherParticipant: IParticipantDto;
    lastMessage?: IMessage;
    lastMessageAt: Date;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IGetConversationsResponse {
    conversations: IConversationDto[];
    total: number;
}
