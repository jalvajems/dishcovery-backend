import { createClient } from "redis";
import { log } from "../utils/logger";

export const redisClient=createClient();

redisClient.on('connect',()=>log.info('redis connected succefuly'))
redisClient.on('error',(err)=>log.error('redis failed to connect:',err))