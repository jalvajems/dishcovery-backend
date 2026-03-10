import axios from 'axios';
import { env } from '../../config/env.config';
import { Role } from '../../types/user.types';

export class AiService {
    private static readonly API_URL = "https://openrouter.ai/api/v1/chat/completions";
    private static readonly MODEL = "openrouter/free";

    async getChatResponse(message: string, role: string): Promise<string> {
        try {
            const systemPrompt = this.getSystemPrompt(role);

            const response = await axios.post(
                AiService.API_URL,
                {
                    model: AiService.MODEL,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: message }
                    ]
                },
                {
                    headers: {
                        "Authorization": `Bearer ${env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:5173",
                        "X-Title": "Dishcovery"
                    }
                }
            );

            if (response.data && response.data.choices && response.data.choices.length > 0) {
                return response.data.choices[0].message.content;
            }

            return "I apologize, but I couldn't generate a response at this moment. Please try again.";

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            const responseData = axios.isAxiosError(error) ? error.response?.data : null;
            console.error("AI Service Error:", responseData || errorMessage);
            throw new Error("Failed to communicate with AI service");
        }
    }

    private getSystemPrompt(role: string): string {
        const basePrompt = `You are Dishcovery AI — a culinary specialist assistant.
Data: You only answer questions about food, cooking, recipes, ingredients, culinary techniques, kitchen tools, and nutrition basics.
Constraint: If the question is unrelated, politely refuse.
Constraint: Do NOT output your internal thought process or reasoning. Give the DIRECT answer to the user.
Constraint: Keep responses concise, structured, and easy to read.`;

        if (role === Role.CHEF) {
            return `${basePrompt}
The user is a professional CHEF.
- Use professional terms but keep it conversational.
- Provide valuable technical insights but avoid being overly academic or verbose.
- Focus on practical applications and concise pro-tips.`;
        } else {
            return `${basePrompt}
The user is a FOODIE (home cook or enthusiast).
- Provide simple, beginner-friendly answers.
- Give step-by-step guidance.
- Focus on accessibility and enjoyment.`;
        }
    }
}
