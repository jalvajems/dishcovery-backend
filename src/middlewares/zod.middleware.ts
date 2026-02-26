import { AnyZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { STATUS_CODE } from "../constants/StatusCode";
import { AppError } from "../utils/AppError";
import { MESSAGES } from "../constants/Message";

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse(req.body);
        next();k
    } catch (error) {
        if (error instanceof ZodError) {
            const issues = error.errors || error.issues || [];
            const errorMessage = issues.map((err: any) => `${err.path[err.path.length - 1]}: ${err.message}`).join(", ") || error.message;
            return next(new AppError(errorMessage, STATUS_CODE.BAD_REQUEST));
        }
        next(new AppError(MESSAGES.ERROR.INTERNAL_SERVER_ERROR, STATUS_CODE.INTERNAL_SERVER_ERROR));
    }
};