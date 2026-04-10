import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().default("4000"),
    MONGO_URI: z.string().min(1, "MONGO_URI is required!"),
    JWT_ACCESS_SECRET: z.string().optional(),
    JWT_REFRESH_SECRET: z.string().optional(),
    OPENROUTER_API_KEY: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    REDIS_URL: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_BUCKET_NAME: z.string().optional(),
    AWS_REGION: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    VITE_MAPBOX_TOKEN: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    BASE_URL: z.string().optional(),
}).refine((data) => {
    if (data.NODE_ENV === "production" && !data.GOOGLE_CLIENT_ID) {
        return false;
    }
    return true;
}, {
    message: "GOOGLE_CLIENT_ID is required in production",
    path: ["GOOGLE_CLIENT_ID"]
});

// Safely parse the environment
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    parsed.error.issues.forEach((issue) => {
        console.error(`- ${issue.path.join(".")}: ${issue.message}`);
    });
    process.exit(1);
}

export const env = {
    NODE_ENV: parsed.data.NODE_ENV,
    PORT: Number(parsed.data.PORT),
    MONGO_URI: parsed.data.MONGO_URI,
    JWT_ACCESS_SECRET: parsed.data.JWT_ACCESS_SECRET || "",
    JWT_REFRESH_SECRET: parsed.data.JWT_REFRESH_SECRET || "",
    OPENROUTER_API_KEY: parsed.data.OPENROUTER_API_KEY,
    GOOGLE_CLIENT_ID: parsed.data.GOOGLE_CLIENT_ID,
    REDIS_URL: parsed.data.REDIS_URL,
    AWS_ACCESS_KEY_ID: parsed.data.AWS_ACCESS_KEY_ID,
    AWS_BUCKET_NAME: parsed.data.AWS_BUCKET_NAME,
    AWS_REGION: parsed.data.AWS_REGION,
    AWS_SECRET_ACCESS_KEY: parsed.data.AWS_SECRET_ACCESS_KEY,
    VITE_MAPBOX_TOKEN: parsed.data.VITE_MAPBOX_TOKEN,
    STRIPE_WEBHOOK_SECRET: parsed.data.STRIPE_WEBHOOK_SECRET,
    STRIPE_SECRET_KEY: parsed.data.STRIPE_SECRET_KEY,
    BASE_URL: parsed.data.BASE_URL,
};

export type Env = typeof env;