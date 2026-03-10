import { Router } from "express";
import container from "../DI/inversify.config";
import { ChatController } from "../controllers/implementation/chat.controller";
import { verifyAccess } from "../middlewares/verifyAccess";

const router = Router();
const chatController = container.get<ChatController>(ChatController);


router.use(verifyAccess);


router.post('/conversation', chatController.createOrGetConversation);

router.get('/conversations', chatController.getUserConversations);


router.post('/message', chatController.sendMessage);


router.get('/messages/:conversationId', chatController.getMessages);

router.put('/read/:conversationId', chatController.markAsRead);


router.delete('/message/:messageId', chatController.deleteMessage);

export default router;
