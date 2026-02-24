import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { STATUS_CODE } from "../constants/StatusCode";
import container from "../DI/inversify.config";
import TYPES from "../DI/types";
import { IUserRepository } from "../repostories/interface/IUserRepository";
import { CHEF_MESSAGES, MESSAGES } from "../constants/Message";

export const isVerifyChef=async(req: Request, res: Response, next: NextFunction)=>{
    const id=req.user?.id;
    const _userRepository=container.get<IUserRepository>(TYPES.IUserRepository)

    if(!id){
        throw new AppError(MESSAGES.AUTH.UNAUTHORIZED,STATUS_CODE.UNAUTHORIZED);
    }
     const chef=await _userRepository.findById(id)
     if (!chef) {
    throw new AppError(CHEF_MESSAGES.PROFILE_NOT_FOUND, STATUS_CODE.NOT_FOUND);
  }
  if (!chef.isVerified) {
    res.status(STATUS_CODE.NOT_FOUND).json({message:CHEF_MESSAGES.NOT_VERIFIED})
    throw new AppError(
      CHEF_MESSAGES.NOT_VERIFIED,
      STATUS_CODE.NOT_FOUND
    );
  }

  next();

}