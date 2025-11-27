import { Request, Response, NextFunction } from "express";
import { IReviewController } from "../interface/IReviewController";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IReviewService } from "../../services/interface/IReviewService";
import { STATUS_CODE } from "../../constants/StatusCode";
import { AppError } from "../../utils/AppError";

@injectable()
export class ReviewController implements IReviewController {
    constructor(
        @inject(TYPES.IReviewService) private _reviewService: IReviewService
    ) { }
    async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log('reached review cotrler');
        try {
            console.log('reached review cotrler1');
            
            const userId = req.user?.id;
            console.log('requser',req.user);
            
            if (!userId) throw new AppError('Unauthorized',STATUS_CODE.UNAUTHORIZED)
                
                const data = req.body;
                
                const result = await this._reviewService.createReview(userId, data)
                console.log('result:', result);
                res.status(STATUS_CODE.SUCCESS).json({ data: result, message: 'review got successfully' });
                
            } catch (error) {
            throw error
        }
    }
    async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id, type } = req.query;      
            if (!id || !type) throw new AppError('missing id or type',STATUS_CODE.BAD_REQUEST)
                const result = await this._reviewService.getReviews(id as string, type as string);
            console.log('result getreviw:', result);
            res.status(STATUS_CODE.SUCCESS).json({ success:true, data: result, message: 'review recieved' });
            
        } catch (error) {
            next(error);
        }
    }
    async likeReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reviewId } = req.params;
            const userId= req.user?.id;
            if (!userId) throw new AppError('Unauthorized',STATUS_CODE.UNAUTHORIZED)

            const result = await this._reviewService.toggleLike(reviewId, userId as string)
            res.status(STATUS_CODE.SUCCESS).json({ data: result, message: 'like toggled' });
        } catch (error) {
            throw error
        }
    }
    async dislikeReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reviewId } = req.params;
            const userId  = req.user?.id;
            const result = await this._reviewService.toggleDislike(reviewId, userId as string)
            res.status(STATUS_CODE.SUCCESS).json({ data: result, message: 'dislike done' })
        } catch (error) {
            throw error
        }
    }
}