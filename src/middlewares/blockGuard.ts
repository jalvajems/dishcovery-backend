import { NextFunction, Request, Response } from "express";
import container from "../DI/inversify.config";
import { IUserRepository } from "../repostories/interface/IUserRepository";
import TYPES from "../DI/types";
import { log } from "../utils/logger";
import { STATUS_CODE } from "../constants/StatusCode";

export const blockGuard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body
        const userRepository = container.get<IUserRepository>(TYPES.IUserRepository)
        const userData = await userRepository.findByEmail(email)

        if (userData?.isBlocked) {
            
            res.clearCookie('refreshToken')
            return res.status(STATUS_CODE.FORBIDDEN).json({message: 'Your account is blocked by admin!!'});
        }
        next()
    } catch (error) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ message: 'Invalid or expired access token' });
    }
}