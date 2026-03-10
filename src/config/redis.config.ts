import { createClient } from "redis";
import { log } from "../utils/logger";
import { env } from "./env.config";

export const redisClient = createClient({
    url: env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('connect', () => log.info('redis connected succefuly'))
redisClient.on('error', (err) => log.error('redis failed to connect:', err))