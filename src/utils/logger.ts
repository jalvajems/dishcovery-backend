import { createLogger, format, transports } from 'winston';
import { env } from '../config/env.config';
import DailyRotateFile from 'winston-daily-rotate-file';

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

const combinedRotateTransport = new DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: process.env.MAX_FILE_COMBINEDROTATETRANSPORT,
});

const errorRotateTransport = new DailyRotateFile({
  level: 'error',
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '10m',
  maxFiles: process.env.MAX_FILE_ERRORROTATETRANSPORT,
});

export const logger = createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format: env.NODE_ENV === "development" ? devFormat : profFormat,
  transports: [
    new transports.Console(),
    combinedRotateTransport,
    errorRotateTransport,
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' }),
  ],
});

export const log = {
  info: (msg: string, ...meta: unknown[]) => logger.info(msg, ...meta),
  warn: (msg: string, ...meta: unknown[]) => logger.warn(msg, ...meta),
  error: (msg: string, ...meta: unknown[]) => logger.error(msg, ...meta),
  debug: (msg: string, ...meta: unknown[]) => logger.debug(msg, ...meta),
};