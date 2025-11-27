import { Container } from "inversify";
import { IReviewRepostory } from "../../repostories/interface/IReviewRepository";
import TYPES from "../types";
import { ReviewRepositry } from "../../repostories/implementation/review.repository";
import { IReviewService } from "../../services/interface/IReviewService";
import { ReviewService } from "../../services/implementation/review.service";
import { IReviewController } from "../../controllers/interface/IReviewController";
import { ReviewController } from "../../controllers/implementation/review.controller";

export function reviewModule(container:Container){
    container.bind<IReviewRepostory>(TYPES.IReviewRepository).to(ReviewRepositry)
    container.bind<IReviewService>(TYPES.IReviewService).to(ReviewService),
    container.bind<IReviewController>(TYPES.IReviewController).to(ReviewController)
}