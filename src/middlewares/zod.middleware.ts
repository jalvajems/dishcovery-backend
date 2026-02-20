import { AnyZodObject, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { STATUS_CODE } from "../constants/StatusCode";
import { AppError } from "../utils/AppError";

export const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessage = error.errors.map((err) => err.message).join(", ");
            return next(new AppError(errorMessage, STATUS_CODE.BAD_REQUEST));
        }
        next(new AppError("Internal Server Error", STATUS_CODE.INTERNAL_SERVER_ERROR));
    }
};