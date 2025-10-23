import mongoose from "mongoose";
import {env} from './env.config';
import { log } from "../utils/logger";

export const connectDB=async ()=>{
    try {
        await mongoose.connect(env.MONGO_URI);
        log.info("MongoDB is connected successfully");
        
    } catch (error) {
        log.error(`MongoDB connection failed: ${error}`);
        process.exit(1);
    }

}
