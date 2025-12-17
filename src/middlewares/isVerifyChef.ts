import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { STATUS_CODE } from "../constants/StatusCode";
import container from "../DI/inversify.config";
import { IChefRepository } from "../repostories/interface/IChefRepository";
import TYPES from "../DI/types";
import { IUserRepository } from "../repostories/interface/IUserRepository";

export const isVerifyChef=async(req: Request, res: Response, next: NextFunction)=>{
    const id=req.user?.id;
    const _userRepository=container.get<IUserRepository>(TYPES.IUserRepository)

    if(!id){
        throw new AppError('Unauthorized',STATUS_CODE.UNAUTHORIZED);
    }
     const chef=await _userRepository.findById(id)
     if (!chef) {
    throw new AppError("Chef profile not found", STATUS_CODE.NOT_FOUND);
  }
  if (!chef.isVerified) {
    res.status(STATUS_CODE.NOT_FOUND).json({message:'not verified'})
    throw new AppError(
      "Chef is not verified by admin",
      STATUS_CODE.NOT_FOUND
    );
  }

  next();

}