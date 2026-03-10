import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().default("4000"),
    MONGO_URI: z.string().min(1, "MONGO_URI is required!"),
    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    OPENROUTER_API_KEY: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    REDIS_URL: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
    console.error("Invalid env variables");
    parsed.error.issues.forEach((issue) => {
        console.error(`${issue.path.join(".")}: ${issue.message}`);
    });
    process.exit(1);
}

export const env = {
    NODE_ENV: parsed.data.NODE_ENV,
    PORT: Number(parsed.data.PORT),
    MONGO_URI: parsed.data.MONGO_URI,
    JWT_ACCESS_SECRET: parsed.data.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: parsed.data.JWT_REFRESH_SECRET,
    OPENROUTER_API_KEY: parsed.data.OPENROUTER_API_KEY,
    GOOGLE_CLIENT_ID: parsed.data.GOOGLE_CLIENT_ID,
    REDIS_URL: parsed.data.REDIS_URL,
}

export type Env = typeof env;