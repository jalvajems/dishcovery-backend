import { NextFunction, Request, Response } from "express";

export interface IReviewController {
    createReview(req:Request,res:Response,next:NextFunction):Promise<void>;
    getReviews(req:Request,res:Response,next:NextFunction):Promise<void>;
    likeReview(req:Request,res:Response,next:NextFunction):Promise<void>;
    dislikeReview(req:Request,res:Response,next:NextFunction):Promise<void>;
}