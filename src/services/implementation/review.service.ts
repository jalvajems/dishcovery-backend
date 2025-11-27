import { inject, injectable } from "inversify";
import { IReviewService } from "../interface/IReviewService";
import TYPES from "../../DI/types";
import { IReviewRepostory } from "../../repostories/interface/IReviewRepository";
import { IReview } from "../../types/review.types";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { IReviewDocument } from "../../models/review.model";
import { Types } from "mongoose";

@injectable()
export class ReviewService implements IReviewService {
    constructor(
        @inject(TYPES.IReviewRepository) private _reviewRepository: IReviewRepostory,
    ) { }

    async createReview(userId: string, data: any): Promise<{ data: IReviewDocument; }> {
        try {
            const { reviewableId, reviewableType, rating, reviewText } = data;

            const payload = {
                userId: new Types.ObjectId(userId),
                reviewableId: new Types.ObjectId(reviewableId),
                reviewableType,
                rating,
                reviewText,
                likes: [],
                dislikes: [],
            };

            const restult = await this._reviewRepository.create(payload as Partial<IReviewDocument>)
            return { data: restult }
        } catch (error) {
            throw error
        }
    }
    async getReviews(reviewableId: string, reviewableType: string): Promise<{ data: IReviewDocument[]; }> {
        try {
            const result = await this._reviewRepository.findReview(reviewableId, reviewableType)
            return { data: result };
        } catch (error) {
            throw error;
        }
    }
    async toggleLike(reviewId: string, userId: string): Promise<IReviewDocument> {
        try {
            const review = await this._reviewRepository.findById(reviewId)
            if (!review) throw new AppError('no review found', STATUS_CODE.SUCCESS);

            const uId = userId.toString()

            const alreadyLiked = review.likes.some(id => id.toString() === uId);
            if (alreadyLiked) {
                review.likes = review.likes.filter(id => id.toString() !== uId);
            } else {
                review.likes.push(new Types.ObjectId(uId));
                review.dislikes = review.dislikes.filter(id => id.toString() !== uId);
            }

            await review.save();
            return review
        } catch (error) {
            throw error;
        }
    }
  async toggleDislike(reviewId: string, userId: string): Promise<IReviewDocument> {
    try {
        const review = await this._reviewRepository.findById(reviewId);
        if (!review) throw new AppError('no review found', STATUS_CODE.BAD_REQUEST);
console.log('uriddd',reviewId);

        const uId = userId?.toString();
        if (!uId) throw new AppError("Invalid user id", STATUS_CODE.BAD_REQUEST);

        // Clean invalid entries
        review.dislikes = review.dislikes.filter(id => id);
        review.likes = review.likes.filter(id => id);

        const alreadyDisLiked = review.dislikes.some(id => id.toString() === uId);

        if (alreadyDisLiked) {
            review.dislikes = review.dislikes.filter(id => id.toString() !== uId);
        } else {
            review.dislikes.push(new Types.ObjectId(uId));
            review.likes = review.likes.filter(id => id.toString() !== uId);
        }

        await review.save();
        return review;

    } catch (error) {
        throw error;
    }
}

}