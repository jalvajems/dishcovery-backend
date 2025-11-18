import { redisClient } from "../../config/redis.config";
import { IRefreshtokenRepository } from "../interface/IRefreshtokenRepository";

export class RefreshTokenRepository implements IRefreshtokenRepository {

    private getTTL() {
        const ttl = Number(process.env.REDIS_REFRESH_EXP);
        if (!ttl || isNaN(ttl)) {
            throw new Error("Invalid REFRESH_EXP value, must be a number in seconds");
        }
        return ttl;
    }

   async createRefreshToken(userId: string, refreshToken: string): Promise<void> {
       await redisClient.set(`refreshKey:${userId}`,refreshToken,{EX:this.getTTL()})
       await redisClient.set(`refreshLookup:${refreshToken}`,userId,{EX:this.getTTL()})
   }

    async findByUserId(userId: string): Promise<string | null> {
        const key = `refreshKey:${userId}`;
        return await redisClient.get(key);
    }

    async findByToken(refreshToken: string): Promise<string | null> {
        const key = `refreshLookup:${refreshToken}`;
        return await redisClient.get(key);
    }

    async deleteByUserId(userId: string): Promise<void> {
        const old=await this.findByUserId(userId);
        if(old)await redisClient.del(`refreshLookup:${old}`);
        await redisClient.del(`refreshKey:${userId}`);
    }

    async deleteByToken(refreshToken: string): Promise<void> {
        const userId = await this.findByToken(refreshToken);
        if (userId) await redisClient.del(`refreshKey:${userId}`);
        await redisClient.del(`refreshLookup:${refreshToken}`)

    }
}
