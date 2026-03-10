import { ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';
import { STATUS_CODE } from '../constants/StatusCode';
import { MESSAGES } from '../constants/Message';
import { ZodError } from 'zod';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  logger.error(err);
  if (err instanceof ZodError) {
    console.error("Validation failed");
    err.issues.forEach(issue => {
      console.log(`Field: ${issue.path.join('.')}, Error: ${issue.message}`);
    });
  }
  const statusCode =
    err instanceof AppError && Number.isInteger(err.statusCode)
      ? err.statusCode
      : STATUS_CODE.INTERNAL_SERVER_ERROR;

  const message = err instanceof AppError || err instanceof Error
    ? err.message
    : MESSAGES.ERROR;

  res.status(statusCode).json({
    success: false,
    message
  });
};