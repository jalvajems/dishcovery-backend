import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';

const aiRouter = Router();
const aiController = new AiController();

aiRouter.post('/chat', aiController.chat.bind(aiController));

export default aiRouter;
