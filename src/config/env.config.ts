import dotenv from 'dotenv'
import { z } from 'zod'
import { getSecret } from './vault.config'

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
}).refine((data) => {
    if (data.NODE_ENV === "production" && !data.GOOGLE_CLIENT_ID) {
        return false;
    }
    return true;
}, {
    message: "GOOGLE_CLIENT_ID is required in production",
    path: ["GOOGLE_CLIENT_ID"]
});



export const env = {
    NODE_ENV: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
    PORT: Number(process.env.PORT) || 4000,
    MONGO_URI: process.env.MONGO_URI || "",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    REDIS_URL: process.env.REDIS_URL,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    AWS_REGION: process.env.AWS_REGION,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    VITE_MAPBOX_TOKEN: process.env.VITE_MAPBOX_TOKEN,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
};

export const loadVaultSecrets = async () => {
    try {
        console.log("🔐 Loading Vault secrets...");
        const secrets = await getSecret('secret/data/dishcovery');

        // Merge Vault secrets into process.env before validation
        if (secrets.MONGO_URI) process.env.MONGO_URI = secrets.MONGO_URI;
        if (secrets.JWT_ACCESS_SECRET) process.env.JWT_ACCESS_SECRET = secrets.JWT_ACCESS_SECRET;
        if (secrets.JWT_REFRESH_SECRET) process.env.JWT_REFRESH_SECRET = secrets.JWT_REFRESH_SECRET;
        if (secrets.AWS_ACCESS_KEY_ID) process.env.AWS_ACCESS_KEY_ID = secrets.AWS_ACCESS_KEY_ID;
        if (secrets.AWS_BUCKET_NAME) process.env.AWS_BUCKET_NAME = secrets.AWS_BUCKET_NAME;
        if (secrets.AWS_REGION) process.env.AWS_REGION = secrets.AWS_REGION;
        if (secrets.AWS_SECRET_ACCESS_KEY) process.env.AWS_SECRET_ACCESS_KEY = secrets.AWS_SECRET_ACCESS_KEY;
        if (secrets.VITE_MAPBOX_TOKEN) process.env.VITE_MAPBOX_TOKEN = secrets.VITE_MAPBOX_TOKEN;
        if (secrets.STRIPE_WEBHOOK_SECRET) process.env.STRIPE_WEBHOOK_SECRET = secrets.STRIPE_WEBHOOK_SECRET;
        if (secrets.STRIPE_SECRET_KEY) process.env.STRIPE_SECRET_KEY = secrets.STRIPE_SECRET_KEY;
        if (secrets.OPENROUTER_API_KEY) process.env.OPENROUTER_API_KEY = secrets.OPENROUTER_API_KEY;
        if (secrets.GOOGLE_CLIENT_ID) process.env.GOOGLE_CLIENT_ID = secrets.GOOGLE_CLIENT_ID;

        // Safely parse the environment
        const parsed = envSchema.safeParse(process.env);

        if (!parsed.success) {
            console.error("❌ Invalid environment variables:");
            parsed.error.issues.forEach((issue) => {
                console.error(`- ${issue.path.join(".")}: ${issue.message}`);
            });
            process.exit(1);
        }

        // Mutate the existing env object to provide correct typings without breaking synchronous references
        Object.assign(env, {
            NODE_ENV: parsed.data.NODE_ENV,
            PORT: Number(parsed.data.PORT),
            MONGO_URI: parsed.data.MONGO_URI,
            JWT_ACCESS_SECRET: parsed.data.JWT_ACCESS_SECRET,
            JWT_REFRESH_SECRET: parsed.data.JWT_REFRESH_SECRET,
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
        });

        console.log("✅ Env validated & ready (with Vault secrets)");
    } catch (error) {
        console.error("❌ Failed to load Vault secrets:", error);
        process.exit(1);
    }
};

export type Env = typeof env;