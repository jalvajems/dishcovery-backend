import { IMessageDto } from "../../dtos/chat.dtos";
import { IMessage } from "../../models/message.model";
import { expandImageUrl } from "../imageUtils";

export function messageMapper(message: IMessage): IMessageDto {
    const obj = message.toObject ? message.toObject() : message;
    return {
        _id: (obj._id || obj.id).toString(),
        conversationId: obj.conversationId.toString(),
        senderId: obj.senderId?._id ? obj.senderId._id.toString() : obj.senderId.toString(),
        senderRole: obj.senderRole,
        content: obj.content,
        fileUrl: expandImageUrl(obj.fileUrl),
        messageType: obj.messageType,
        status: obj.status,
        readBy: (obj.readBy as unknown[])?.map((id: unknown) => typeof id === 'object' && id !== null && 'toString' in id ? id.toString() : String(id)) || [],
        deletedFor: (obj.deletedFor as unknown[])?.map((id: unknown) => typeof id === 'object' && id !== null && 'toString' in id ? id.toString() : String(id)) || [],
        isDeletedForEveryone: obj.isDeletedForEveryone,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    };
}

export function allMessagesMapper(messages: IMessage[]): IMessageDto[] {
    return messages.map(message => messageMapper(message));
}
