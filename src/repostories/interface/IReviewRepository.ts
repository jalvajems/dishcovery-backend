import { IRecipeDocument } from "../../models/recipe.model";
import { IReviewDocument } from "../../models/review.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IReviewRepostory extends IBaseRepository<IReviewDocument>{
    findReview(reviewableId:string,reviewableType:string):Promise<IReviewDocument[]>
}