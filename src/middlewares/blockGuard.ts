import { NextFunction, Request, Response } from "express";
import container from "../DI/inversify.config";
import { IUserRepository } from "../repostories/interface/IUserRepository";
import TYPES from "../DI/types";
import { STATUS_CODE } from "../constants/StatusCode";
import { MESSAGES } from "../constants/Message";

export const blockGuard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body
        const userRepository = container.get<IUserRepository>(TYPES.IUserRepository)
        const userData = await userRepository.findByEmail(email)

        if (userData?.isBlocked) {

            res.clearCookie('refreshToken')
            return res.status(STATUS_CODE.FORBIDDEN).json({ message: MESSAGES.USER.BLOCKED_BY_ADMIN });
        }
        next()
    } catch {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ message: MESSAGES.AUTH.INVALIDE_TOKEN });
    }
}