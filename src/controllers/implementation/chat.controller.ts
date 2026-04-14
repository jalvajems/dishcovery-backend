import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { Role } from '../../types/user.types';
import { IChatService } from "../../services/interface/chat.service.interface";
import { CHAT_MESSAGES } from "../../constants/Message";
import { STATUS_CODE } from "../../constants/StatusCode";

interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        role: Role;
    };
}

@injectable()
export class ChatController {

    constructor(
        @inject('IChatService') private chatService: IChatService
    ) { }

    createOrGetConversation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { otherUserId, otherUserRole } = req.body;
            const user = (req as unknown as AuthenticatedRequest).user;
            const userId = user.id;
            const userRole = user.role;

            if (!otherUserId || !otherUserRole) {
                res.status(STATUS_CODE.BAD_REQUEST).json({ message:CHAT_MESSAGES.OTHERID_REQUIRED  });
                return;
            }

            const currentUserRole: Role = userRole === Role.CHEF ? Role.CHEF : Role.FOODIE;

            const conversation = await this.chatService.getOrCreateConversation(
                userId,
                otherUserId,
                currentUserRole,
                otherUserRole
            );

            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                conversation
            });
        } catch (error: unknown) {
            console.error('Error in createOrGetConversation:', error);
            const message = error instanceof Error ? error.message : CHAT_MESSAGES.CREATE_CONVERSATION_FAILED;
            res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
                success: false,
                message
            });
        }
    };

    getUserConversations = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = (req as unknown as AuthenticatedRequest).user;
            const userId = user.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const { conversations, total } = await this.chatService.getUserConversations(userId, page, limit);

            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                conversations,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message :CHAT_MESSAGES.FAILED_FETCH_CONVERSATION;
            res.status(STATUS_CODE.NOT_FOUND).json({
                success: false,
                message
            });
        }
    };


    sendMessage = async (req: Request, res: Response): Promise<void> => {
        try {
            const { conversationId, content, fileUrl, messageType } = req.body;
            const user = (req as unknown as AuthenticatedRequest).user;
            const senderId = user.id;
            const senderRole = user.role;

            if (!conversationId || (!content && !fileUrl)) {
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: CHAT_MESSAGES.CONVERSATIONID_AND_CONTENT_REQUIRED });
                return;
            }

            const mappedSenderRole: Role = senderRole === Role.CHEF ? Role.CHEF : Role.FOODIE;

            const message = await this.chatService.sendMessage(senderId, mappedSenderRole, conversationId, content, fileUrl, messageType);

            res.status(STATUS_CODE.CREATED).json({
                success: true,
                message
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : CHAT_MESSAGES.FAILED_SEND_MESSAGE ;
            res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
                success: false,
                message
            });
        }
    };

    getMessages = async (req: Request, res: Response): Promise<void> => {
        try {
            const { conversationId } = req.params;
            const user = (req as unknown as AuthenticatedRequest).user;
            const userId = user.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;

            const { messages, total } = await this.chatService.getMessages(conversationId, userId, page, limit);

            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                messages,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : CHAT_MESSAGES.FAILED_FETCH_MESSAGE;
            res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
                success: false,
                message
            });
        }
    };

    markAsRead = async (req: Request, res: Response): Promise<void> => {
        try {
            const { conversationId } = req.params;
            const user = (req as unknown as AuthenticatedRequest).user;
            const userId = user.id;

            await this.chatService.markAsRead(conversationId, userId);

            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                message: CHAT_MESSAGES.MARKED_AS_READ
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message :CHAT_MESSAGES.FAILED_MARKED_AS_READ ;
            res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
                success: false,
                message
            });
        }
    };

    deleteMessage = async (req: Request, res: Response): Promise<void> => {
        try {
            const { messageId } = req.params;
            const { forEveryone } = req.body;
            const user = (req as unknown as AuthenticatedRequest).user;
            const userId = user.id;

            const updatedMessage = await this.chatService.deleteMessage(messageId, userId, forEveryone);

            if (!updatedMessage) {
                res.status(STATUS_CODE.NOT_FOUND).json({ message: CHAT_MESSAGES.MESSAGE_NOT_FOUND });
                return;
            }

            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                message:CHAT_MESSAGES.MESSAGE_DELETED ,
                data: updatedMessage
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : CHAT_MESSAGES.FAILED_MESSAGE_DELETED;
            res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).json({
                success: false,
                message
            });
        }
    };
}
