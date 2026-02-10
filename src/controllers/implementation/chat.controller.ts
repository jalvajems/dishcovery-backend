import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { Role } from '../../types/user.types';
import { IChatService } from "../../services/interface/chat.service.interface";

@injectable()
export class ChatController {

    constructor(
        @inject('IChatService') private chatService: IChatService
    ) { }

    createOrGetConversation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { otherUserId, otherUserRole } = req.body;
            const userId = (req as any).user.id;
            const userRole = (req as any).user.role;

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
        } catch (error: any) {
            console.error('Error in createOrGetConversation:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create/get conversation'
            });
        }
    };

    getUserConversations = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = (req as any).user.id;
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
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch conversations'
            });
        }
    };


    sendMessage = async (req: Request, res: Response): Promise<void> => {
        try {
            const { conversationId, content } = req.body;
            const senderId = (req as any).user.id;
            const senderRole = (req as any).user.role;

            if (!conversationId || !content) {
                res.status(400).json({ message: 'Conversation ID and content are required' });
                return;
            }

            const mappedSenderRole: Role = senderRole === Role.CHEF ? Role.CHEF : Role.FOODIE;

            const message = await this.chatService.sendMessage(senderId, mappedSenderRole, conversationId, content);

            res.status(201).json({
                success: true,
                message
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to send message'
            });
        }
    };

    getMessages = async (req: Request, res: Response): Promise<void> => {
        try {
            const { conversationId } = req.params;
            const userId = (req as any).user.id;
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
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch messages'
            });
        }
    };

    markAsRead = async (req: Request, res: Response): Promise<void> => {
        try {
            const { conversationId } = req.params;
            const userId = (req as any).user.id;

            await this.chatService.markAsRead(conversationId, userId);

            res.status(200).json({
                success: true,
                message: 'Messages marked as read'
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to mark messages as read'
            });
        }
    };

    deleteMessage = async (req: Request, res: Response): Promise<void> => {
        try {
            const { messageId } = req.params;
            const { forEveryone } = req.body;
            const userId = (req as any).user.id;

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
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to delete message'
            });
        }
    };
}
