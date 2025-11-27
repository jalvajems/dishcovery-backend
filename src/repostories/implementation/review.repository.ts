import { Types } from "mongoose";
import { IReviewDocument, ReviewModel } from "../../models/review.model";
import { IReviewRepostory } from "../interface/IReviewRepository";
import { BaseRepository } from "./base.repository";

export class ReviewRepositry extends BaseRepository<IReviewDocument> implements IReviewRepostory{
    constructor(){
        super(ReviewModel)
    }
    async findReview(reviewableId: string, reviewableType: string): Promise<IReviewDocument[]> {
        return await ReviewModel.find({
            reviewableId:new Types.ObjectId(reviewableId),
            reviewableType,
        }).populate("userId","name");
    }
}