import { ZodSchema, ZodError, ZodIssue } from "zod";
import { Request, Response, NextFunction } from "express";
import { STATUS_CODE } from "../constants/StatusCode";
import { AppError } from "../utils/AppError";
import { MESSAGES } from "../constants/Message";

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const issues = error.issues || [];
            const errorMessage = issues.map((err: ZodIssue) => `${String(err.path[err.path.length - 1])}: ${err.message}`).join(", ") || error.message;
            return next(new AppError(errorMessage, STATUS_CODE.BAD_REQUEST));
        }
        next(new AppError(MESSAGES.ERROR.INTERNAL_SERVER_ERROR, STATUS_CODE.INTERNAL_SERVER_ERROR));
    }
};