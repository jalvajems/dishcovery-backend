import { Request, Response, NextFunction } from 'express';
import { STATUS_CODE } from '../../constants/StatusCode';
import { Role } from '../../types/user.types';
import { AiService } from '../../services/implementation/ai.service';

export class AiController {
    private aiService: AiService;

    constructor() {
        this.aiService = new AiService();
    }

    async chat(req: Request, res: Response, next: NextFunction) {
        try {
            const { message, role } = req.body;

            if (!message || typeof message !== 'string') {
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Message is required and must be a string." });
                return
            }

            if (message.length > 500) {
                res.status(STATUS_CODE.BAD_REQUEST).json({ message: "Message is too long. Max 500 characters." });
                return
            }

            const userRole = (role === Role.CHEF || role === Role.FOODIE) ? role : Role.FOODIE;

            const reply = await this.aiService.getChatResponse(message, userRole);

            res.status(STATUS_CODE.SUCCESS).json({ reply });

        } catch (error) {
            next(error);
        }
    }
}
