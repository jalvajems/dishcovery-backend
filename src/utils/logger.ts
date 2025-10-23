import { createLogger, format, transports } from 'winston';
import { env } from '../config/env.config';

const { combine, timestamp, printf, colorize, json, align } = format;

const devFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  align(),
  printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] ${level}: ${stack || message}`
  })
);

const profFormat = combine(timestamp(), json());

export const logger = createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format: env.NODE_ENV === "development" ? devFormat : profFormat,
  transports: [
    new transports.Console(),

    new transports.File({
      filename: 'logs/combined.log',
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' }),
  ],
});

export const log = {
  info: (msg: string, ...meta: any[]) => logger.info(msg, ...meta),
  warn: (msg: string, ...meta: any[]) => logger.warn(msg, ...meta),
  error: (msg: string, ...meta: any[]) => logger.error(msg, ...meta),
  debug: (msg: string, ...meta: any[]) => logger.debug(msg, ...meta),
};