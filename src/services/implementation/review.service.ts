import { inject, injectable } from "inversify";
import { IReviewService } from "../interface/IReviewService";
import TYPES from "../../DI/types";
import { IReviewRepostory } from "../../repostories/interface/IReviewRepository";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { IReviewDocument } from "../../models/review.model";
import { Types } from "mongoose";
import { ICreateReviewDto, IReviewDto } from "../../dtos/review.dtos";
import { reviewMapper, allReviewsMapper } from "../../utils/mapper/review.mapper";

@injectable()
export class ReviewService implements IReviewService {
    constructor(
        @inject(TYPES.IReviewRepository) private _reviewRepository: IReviewRepostory,
    ) { }

    async createReview(userId: string, data: ICreateReviewDto): Promise<{ data: IReviewDto; }> {
        const { reviewableId, reviewableType, rating, reviewText } = data;

        const existingReview = await this._reviewRepository.findOne({
            userId: new Types.ObjectId(userId),
            reviewableId: new Types.ObjectId(reviewableId),
            reviewableType
        });

        if (existingReview) {
            throw new AppError(`You have already reviewed this ${reviewableType.toLowerCase()}`, STATUS_CODE.BAD_REQUEST);
        }

        const payload: Partial<IReviewDocument> = {
            userId: new Types.ObjectId(userId),
            reviewableId: new Types.ObjectId(reviewableId),
            reviewableType,
            rating,
            reviewText,
            likes: [],
            dislikes: [],
        };

        const restult = await this._reviewRepository.create(payload)
        return { data: reviewMapper(restult) }
    }
    async getReviews(reviewableId: string, reviewableType: string): Promise<{ data: IReviewDto[]; }> {
        const result = await this._reviewRepository.findReview(reviewableId, reviewableType)
        return { data: allReviewsMapper(result) };
    }
    async toggleLike(reviewId: string, userId: string): Promise<IReviewDto> {
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
        return reviewMapper(review);
    }
    async toggleDislike(reviewId: string, userId: string): Promise<IReviewDto> {
        const review = await this._reviewRepository.findById(reviewId);
        if (!review) throw new AppError('no review found', STATUS_CODE.BAD_REQUEST);
        console.log('uriddd', reviewId);

        const uId = userId?.toString();
        if (!uId) throw new AppError("Invalid user id", STATUS_CODE.BAD_REQUEST);

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
        return reviewMapper(review);
    }

    async updateReview(reviewId: string, userId: string, reviewText: string, rating: number): Promise<IReviewDto> {
        const review = await this._reviewRepository.findById(reviewId);
        if (!review) throw new AppError('no review found', STATUS_CODE.NOT_FOUND);

        if (review.userId.toString() !== userId) {
            throw new AppError('You are not authorized to edit this review', STATUS_CODE.FORBIDDEN);
        }

        review.reviewText = reviewText;
        review.rating = rating;

        await review.save();
        return reviewMapper(review);
    }

    async deleteReview(reviewId: string, userId: string): Promise<void> {
        const review = await this._reviewRepository.findById(reviewId);
        if (!review) throw new AppError('no review found', STATUS_CODE.NOT_FOUND);

        if (review.userId.toString() !== userId) {
            throw new AppError('You are not authorized to delete this review', STATUS_CODE.FORBIDDEN);
        }

        await this._reviewRepository.deleteById(reviewId);
    }

}