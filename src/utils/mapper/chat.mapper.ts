import { IMessageDto } from "../../dtos/chat.dtos";
import { IMessage } from "../../models/message.model";

export function messageMapper(message: IMessage): IMessageDto {
    const obj = message.toObject ? message.toObject() : message;
    return {
        _id: (obj._id || obj.id).toString(),
        conversationId: obj.conversationId.toString(),
        senderId: obj.senderId?._id ? obj.senderId._id.toString() : obj.senderId.toString(),
        senderRole: obj.senderRole,
        content: obj.content,
        fileUrl: obj.fileUrl,
        messageType: obj.messageType,
        status: obj.status,
        readBy: obj.readBy?.map((id: any) => id.toString()) || [],
        deletedFor: obj.deletedFor?.map((id: any) => id.toString()) || [],
        isDeletedForEveryone: obj.isDeletedForEveryone,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    };
}

export function allMessagesMapper(messages: IMessage[]): IMessageDto[] {
    return messages.map(message => messageMapper(message));
}
