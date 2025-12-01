import { Router } from 'express';
import container from '../DI/inversify.config';
import { IFoodieController } from '../controllers/interface/IFoodieController';
import TYPES from '../DI/types';
import { verifyAccess } from '../middlewares/verifyAccess';
import { IReviewController } from '../controllers/interface/IReviewController';
import { IRecipeController } from '../controllers/interface/IRecipeController';
import { IBlogController } from '../controllers/interface/IBlogController';
const router = Router();

const foodieController = container.get<IFoodieController>(TYPES.IFoodieController);
const ReviewController= container.get<IReviewController>(TYPES.IReviewController);
const RecipeController= container.get<IRecipeController>(TYPES.IRecipeController);
const BlogController= container.get<IBlogController>(TYPES.IBlogController);

console.log('reached router');

router.get('/dashboard', verifyAccess, foodieController.getFoodieDashboard.bind(foodieController))
      .get('/recipe-listing', RecipeController.getAllRecipes.bind(RecipeController))
      .get('/recipe-detail/:id',foodieController.getRecipeDetail.bind(foodieController))
      .get('/related-recipes/:cuisine',RecipeController.getRelatedRecipes.bind(RecipeController))

router.post("/review",verifyAccess, ReviewController.createReview.bind(ReviewController));
router.get("/review", ReviewController.getReviews.bind(ReviewController));
router.put("/review/like/:reviewId",verifyAccess,ReviewController.likeReview.bind(ReviewController));
router.put("/review/dislike/:reviewId",verifyAccess, ReviewController.dislikeReview.bind(ReviewController));

router.get("/blog-listing",verifyAccess,BlogController.getAllBlogs.bind(BlogController))
      .get("/blog-detail/:blogId",verifyAccess,BlogController.getBlogDetails.bind(BlogController))

router.post("/profile",verifyAccess,foodieController.createProfile.bind(foodieController))
router.put("/profile",verifyAccess,foodieController.updateProfile.bind(foodieController))
router.get("/profile",verifyAccess,foodieController.getProfile.bind(foodieController))
      
export default router;