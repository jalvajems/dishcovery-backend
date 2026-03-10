import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.config';
import { log } from '../utils/logger';
import { IUserRepository } from '../repostories/interface/IUserRepository';
import TYPES from '../DI/types';
import container from '../DI/inversify.config';
import { STATUS_CODE } from '../constants/StatusCode';
import { AppError } from '../utils/AppError';



export const   verifyAccess = async (req: Request, res: Response, next: NextFunction) => {

    log.info("middleware 1")

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    
    if (!token) {
        log.info('no token , so no access!')
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ message: 'Accesss token is missing' })
    }

    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: string, role: string };
        req.user = decoded

        const userRepo = container.get<IUserRepository>(TYPES.IUserRepository)
        const user = await userRepo.findById(decoded.id)
        if (!user) {
            log.info('user id is not found!')
            return res.status(STATUS_CODE.NOT_FOUND).json({ message: "No user id found!" })
        }
        if (user.isBlocked) {
            log.info('Your account is blocked by admin!!');
            return res.status(STATUS_CODE.FORBIDDEN).json({
                message: 'Your account is blocked by admin!!'
            });
        }

        next()
    } catch (error) {
        log.info('Error on checking token and admin block!', error);
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ message: 'Invalid or expired access token' });

    }
};
