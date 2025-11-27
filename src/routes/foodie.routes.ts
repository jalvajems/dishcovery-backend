import { Router } from 'express';
import container from '../DI/inversify.config';
import { IFoodieController } from '../controllers/interface/IFoodieController';
import TYPES from '../DI/types';
import { verifyAccess } from '../middlewares/verifyAccess';
import { IReviewController } from '../controllers/interface/IReviewController';
import { IRecipeController } from '../controllers/interface/IRecipeController';
const router = Router();

const foodieController = container.get<IFoodieController>(TYPES.IFoodieController);
const ReviewController= container.get<IReviewController>(TYPES.IReviewController);
const RecipeController= container.get<IRecipeController>(TYPES.IRecipeController);
console.log('reached router');

router.get('/dashboard', verifyAccess, foodieController.getFoodieDashboard.bind(foodieController))
      .get('/recipe-listing', RecipeController.getAllRecipes.bind(RecipeController))
      .get('/recipe-detail/:id',foodieController.getRecipeDetail.bind(foodieController))
      .get('/related-recipes/:cuisine',RecipeController.getRelatedRecipes.bind(RecipeController))
router.put('/edit-profile', foodieController.editFoodieProfile.bind(foodieController))

router.post("/review",verifyAccess, ReviewController.createReview.bind(ReviewController));
router.get("/review", ReviewController.getReviews.bind(ReviewController));
router.put("/review/like/:reviewId",verifyAccess,ReviewController.likeReview.bind(ReviewController));
router.put("/review/dislike/:reviewId",verifyAccess, ReviewController.dislikeReview.bind(ReviewController));
export default router;