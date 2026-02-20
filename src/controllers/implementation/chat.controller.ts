import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { Role } from '../../types/user.types';
import { IChatService } from "../../services/interface/chat.service.interface";

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
                res.status(400).json({ message: 'Other user ID and role are required' });
                return;
            }

            const currentUserRole: Role = userRole === Role.CHEF ? Role.CHEF : Role.FOODIE;

            const conversation = await this.chatService.getOrCreateConversation(
                userId,
                otherUserId,
                currentUserRole,
                otherUserRole
            );

            res.status(200).json({
                success: true,
                conversation
            });
        } catch (error: unknown) {
            console.error('Error in createOrGetConversation:', error);
            const message = error instanceof Error ? error.message : 'Failed to create/get conversation';
            res.status(500).json({
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

            res.status(200).json({
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
            const message = error instanceof Error ? error.message : 'Failed to fetch conversations';
            res.status(500).json({
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
                res.status(400).json({ message: 'Conversation ID and content or file are required' });
                return;
            }

            const mappedSenderRole: Role = senderRole === Role.CHEF ? Role.CHEF : Role.FOODIE;

            const message = await this.chatService.sendMessage(senderId, mappedSenderRole, conversationId, content, fileUrl, messageType);

            res.status(201).json({
                success: true,
                message
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to send message';
            res.status(500).json({
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

            res.status(200).json({
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
            const message = error instanceof Error ? error.message : 'Failed to fetch messages';
            res.status(500).json({
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

            res.status(200).json({
                success: true,
                message: 'Messages marked as read'
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to mark messages as read';
            res.status(500).json({
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
                res.status(404).json({ message: 'Message not found or not authorized to delete' });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Message deleted successfully',
                data: updatedMessage
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to delete message';
            res.status(500).json({
                success: false,
                message
            });
        }
    };
}
