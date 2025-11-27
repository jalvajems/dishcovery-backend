import { IReviewDocument } from "../../models/review.model";
import { IReview } from "../../types/review.types";

export interface IReviewService{
    createReview(userId:string,data:object):Promise<{data:IReviewDocument}>;
    getReviews(reviewableId:string,reviewableType:string):Promise<{data:IReviewDocument[]}>;
    toggleLike(reviewId:string,userId:string):Promise<IReviewDocument>;
    toggleDislike(reviewId:string,userId:string):Promise<IReviewDocument>;
}