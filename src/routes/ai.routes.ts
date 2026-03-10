import { Router } from 'express';
import { AiController } from '../controllers/implementation/ai.controller';

const aiRouter = Router();
const aiController = new AiController();

aiRouter.post('/chat', aiController.chat.bind(aiController));

export default aiRouter;
