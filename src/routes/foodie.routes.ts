import { Router } from 'express';
import container from '../DI/inversify.config';
import { IFoodieController } from '../controllers/interface/IFoodieController';
import TYPES from '../DI/types';
import { verifyAccess } from '../middlewares/verifyAccess';
import { IReviewController } from '../controllers/interface/IReviewController';
import { IRecipeController } from '../controllers/interface/IRecipeController';
import { IBlogController } from '../controllers/interface/IBlogController';
import { validate } from '../middlewares/zod.middleware';
import { createFoodieProfileSchema, updateFoodieProfileSchema } from '../validations/foodieProfileValidation';
const router = Router();

const foodieController = container.get<IFoodieController>(TYPES.IFoodieController);
const ReviewController= container.get<IReviewController>(TYPES.IReviewController);
const RecipeController= container.get<IRecipeController>(TYPES.IRecipeController);
const BlogController= container.get<IBlogController>(TYPES.IBlogController);

console.log('reached router');

router.get('/dashboard', verifyAccess, foodieController.getFoodieDashboard.bind(foodieController))
      .get('/recipe-listing',verifyAccess,RecipeController.getAllRecipes.bind(RecipeController))
      .get('/recipe-detail/:id',verifyAccess,foodieController.getRecipeDetail.bind(foodieController))
      .get('/related-recipes/:cuisine',verifyAccess,RecipeController.getRelatedRecipes.bind(RecipeController))
      .get('/saved-recipes',verifyAccess,RecipeController.getSavedRecipes.bind(RecipeController))
router.post('/toggle-save-recipe',verifyAccess,RecipeController.toggleSaveRecipe.bind(RecipeController))
      .post('/unsave-recipe',verifyAccess,RecipeController.unsaveRecipe.bind(RecipeController))

router.post("/review",verifyAccess, ReviewController.createReview.bind(ReviewController));
router.get("/review",verifyAccess ,ReviewController.getReviews.bind(ReviewController));
router.put("/review/like/:reviewId",verifyAccess,ReviewController.likeReview.bind(ReviewController));
router.put("/review/dislike/:reviewId",verifyAccess, ReviewController.dislikeReview.bind(ReviewController));

router.get("/blog-listing",verifyAccess,BlogController.getAllBlogs.bind(BlogController))
      .get("/blog-detail/:blogId",verifyAccess,BlogController.getBlogDetails.bind(BlogController))

router.post("/profile",validate(createFoodieProfileSchema),verifyAccess,foodieController.createProfile.bind(foodieController))
router.put("/profile",validate(updateFoodieProfileSchema),verifyAccess,foodieController.updateProfile.bind(foodieController))
router.get("/profile",verifyAccess,foodieController.getProfile.bind(foodieController))
      
export default router;