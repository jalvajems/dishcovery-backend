import { redisClient } from "../../config/redis.config";
import { log } from "../../utils/logger";
import { IOtpRepository } from "../interface/IOtpRepository";

export class OtpRepository implements IOtpRepository{
    async createOtp(otp: string, email: string): Promise<void> {
        const key=`otp:${email}`
        await redisClient.set(key,otp,{EX:300});
        
    }
    async findOtp(email: string): Promise<string | null> {
        const key=`otp:${email}`
        const otp= await redisClient.get(key)
        console.log('from find email',otp)
        return otp;
    }
    async delOtp(email: string): Promise<void> {
        const key=`otp:${email}`
        await redisClient.del(key)   
        log.info(  `otp of ${email} deleted`);
    }
}