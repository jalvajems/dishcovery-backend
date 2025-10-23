import { createClient } from "redis";
import { logger } from "../utils/logger";
import { log } from "console";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("connect", () => logger.info("Redis connected")); //logger
redisClient.on("error", (err) => logger.error("Redis Client error: " + err));

(async () => {
  try {
    await redisClient.connect();
    console.log('connected to Redis Cloud');
  } catch (error) {
    console.error('failed to connect Redis Cloud:',error);
      
  }
})();

export default redisClient;
