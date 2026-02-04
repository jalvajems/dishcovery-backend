import { Router } from "express";
import container from "../DI/inversify.config";
import { ChatController } from "../controllers/chat.controller";
import { verifyAccess } from "../middlewares/verifyAccess";

const router = Router();
const chatController = container.get<ChatController>(ChatController);

// All routes require authentication
router.use(verifyAccess);

// Create or get conversation
router.post('/conversation', chatController.createOrGetConversation);

// Get user's conversations
router.get('/conversations', chatController.getUserConversations);

// Send a message
router.post('/message', chatController.sendMessage);

// Get messages for a conversation
router.get('/messages/:conversationId', chatController.getMessages);

// Mark messages as read
// Mark messages as read
router.put('/read/:conversationId', chatController.markAsRead);

// Delete a message
router.delete('/message/:messageId', chatController.deleteMessage);

export default router;
