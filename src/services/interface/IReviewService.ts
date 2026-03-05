import { IReviewDocument } from "../../models/review.model";
import { ICreateReviewDto, IReviewDto } from "../../dtos/review.dtos";

export interface IReviewService {
    createReview(userId: string, data: ICreateReviewDto): Promise<{ data: IReviewDto }>;
    getReviews(reviewableId: string, reviewableType: string): Promise<{ data: IReviewDto[] }>;
    toggleLike(reviewId: string, userId: string): Promise<IReviewDto>;
    toggleDislike(reviewId: string, userId: string): Promise<IReviewDto>;
}