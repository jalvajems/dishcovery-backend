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
        const key = `refreshKey:${userId}`;
        await redisClient.set(key, refreshToken, { EX: this.getTTL() });
    }

    async createForLookupToken(refreshToken: string): Promise<void> {
        const key = `refreshKey:${refreshToken}`;
        await redisClient.set(key, refreshToken, { EX: this.getTTL() });
    }

    async findRefreshTokenById(userId: string): Promise<string | null> {
        const key = `refreshKey:${userId}`;
        return await redisClient.get(key);
    }

    async findRefreshTokenByLookup(refreshToken: string): Promise<string | null> {
        const key = `refreshKey:${refreshToken}`;
        return await redisClient.get(key);
    }

    async delRefreshToken(userId: string): Promise<void> {
        const key = `refreshKey:${userId}`;
        await redisClient.del(key);
    }

    async delRefreshTokenLookup(refreshToken: string): Promise<void> {
        const key = `refreshKey:${refreshToken}`;
        await redisClient.del(key);
    }
}
