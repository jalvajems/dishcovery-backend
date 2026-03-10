import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { log } from '../utils/logger';

export const extractUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: string, role: string };
            req.user = decoded;
        }
    } catch (error) {
        // Token invalid or expired, just ignore and proceed as guest
        log.warn('Failed to extract user from token', error);
    } finally {
        next();
    }
};
