import dotenv from 'dotenv'
import {z} from 'zod'

dotenv.config()

let envSchema=z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().default("4000"),
    MONGO_URI: z.string().min(1, "MONGO_URI is required!")
});

const parsed=envSchema.safeParse(process.env)

if(!parsed.success){
    console.error("Invalid env variables");
    parsed.error.issues.forEach((issue)=>{
        console.error(`${issue.path.join(".")}: ${issue.message}`);
    });
    process.exit(1);
}

export const env={
    NODE_ENV: parsed.data.NODE_ENV,
  PORT: Number(parsed.data.PORT),
  MONGO_URI: parsed.data.MONGO_URI
}

export type Env= typeof env;