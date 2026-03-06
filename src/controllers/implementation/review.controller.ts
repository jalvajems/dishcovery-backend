import { Request, Response, NextFunction } from "express";
import { IReviewController } from "../interface/IReviewController";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IReviewService } from "../../services/interface/IReviewService";
import { STATUS_CODE } from "../../constants/StatusCode";
import { AppError } from "../../utils/AppError";
import { MESSAGES, REVIEW_MESSAGES } from "../../constants/Message";

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
            console.log('requser', req.user);

            if (!userId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED)

            const data = req.body;

            const result = await this._reviewService.createReview(userId, data)
            console.log('result:', result);
            res.status(STATUS_CODE.SUCCESS).json({ data: result, message: REVIEW_MESSAGES.CREATED });

        } catch (error) {
            next(error);
        }
    }
    async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id, type } = req.query;
            if (!id || !type) throw new AppError(REVIEW_MESSAGES.ID_OR_TYPE_MISSING, STATUS_CODE.BAD_REQUEST)
            const result = await this._reviewService.getReviews(id as string, type as string);
            console.log('result getreviw:', result);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result, message: REVIEW_MESSAGES.REVIEW_FETCHED });

        } catch (error) {
            next(error);
        }
    }
    async likeReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reviewId } = req.params;
            const userId = req.user?.id;
            if (!userId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED)

            const result = await this._reviewService.toggleLike(reviewId, userId as string)
            res.status(STATUS_CODE.SUCCESS).json({ data: result, message: REVIEW_MESSAGES.LIKED });
        } catch (error) {
            next(error);
        }
    }
    async dislikeReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reviewId } = req.params;
            const userId = req.user?.id;
            const result = await this._reviewService.toggleDislike(reviewId, userId as string)
            res.status(STATUS_CODE.SUCCESS).json({ data: result, message: REVIEW_MESSAGES.DISLIKED })
        } catch (error) {
            next(error);
        }
    }

    async updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reviewId } = req.params;
            const userId = req.user?.id;
            const { reviewText, rating } = req.body;

            if (!userId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);
            if (!reviewText || rating === undefined) throw new AppError('Review text and rating are required', STATUS_CODE.BAD_REQUEST);

            const result = await this._reviewService.updateReview(reviewId, userId as string, reviewText, rating);
            res.status(STATUS_CODE.SUCCESS).json({ data: result, message: 'Review updated successfully' });
        } catch (error) {
            next(error);
        }
    }

    async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { reviewId } = req.params;
            const userId = req.user?.id;

            if (!userId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);

            await this._reviewService.deleteReview(reviewId, userId as string);
            res.status(STATUS_CODE.SUCCESS).json({ message: 'Review deleted successfully' });
        } catch (error) {
            next(error);
        }
    }
}