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
import { IFoodSpotController } from '../controllers/interface/IFoodSpotController';
import { IWalletController } from '../controllers/interface/IWalletController';
import { IChefController } from '../controllers/interface/IChefController';
import { IWorkshopController } from '../controllers/interface/IWorkshopController';
const router = Router();

const foodieController = container.get<IFoodieController>(TYPES.IFoodieController);
const ReviewController = container.get<IReviewController>(TYPES.IReviewController);
const RecipeController = container.get<IRecipeController>(TYPES.IRecipeController);
const BlogController = container.get<IBlogController>(TYPES.IBlogController);
const FoodSpotController = container.get<IFoodSpotController>(TYPES.IFoodSpotController);
const WalletController = container.get<IWalletController>(TYPES.IWalletController);
const ChefController = container.get<IChefController>(TYPES.IChefController);
const WorkshopController = container.get<IWorkshopController>(TYPES.IWorkshopController);

console.log('reached router');

router.get('/dashboard', verifyAccess, foodieController.getFoodieDashboard.bind(foodieController))
      .get('/recipe-listing', verifyAccess, RecipeController.getAllRecipes.bind(RecipeController))
      .get('/recipes/recent', verifyAccess, RecipeController.getRecentRecipes.bind(RecipeController))
      .get('/recipes/recommended', verifyAccess, RecipeController.getRecommendedRecipes.bind(RecipeController))
      .get('/recipe-detail/:id', verifyAccess, foodieController.getRecipeDetail.bind(foodieController))
      .get('/related-recipes/:cuisine', verifyAccess, RecipeController.getRelatedRecipes.bind(RecipeController))
      .get('/saved-recipes', verifyAccess, RecipeController.getSavedRecipes.bind(RecipeController))
router.post('/toggle-save-recipe', verifyAccess, RecipeController.toggleSaveRecipe.bind(RecipeController))
      .post('/unsave-recipe', verifyAccess, RecipeController.unsaveRecipe.bind(RecipeController))

router.post("/review", verifyAccess, ReviewController.createReview.bind(ReviewController));
router.get("/review", verifyAccess, ReviewController.getReviews.bind(ReviewController));
router.put("/review/:reviewId", verifyAccess, ReviewController.updateReview.bind(ReviewController));
router.delete("/review/:reviewId", verifyAccess, ReviewController.deleteReview.bind(ReviewController));
router.put("/review/like/:reviewId", verifyAccess, ReviewController.likeReview.bind(ReviewController));
router.put("/review/dislike/:reviewId", verifyAccess, ReviewController.dislikeReview.bind(ReviewController));

router.get("/blog-listing", verifyAccess, BlogController.getAllBlogs.bind(BlogController))
      .get("/blogs/recent", verifyAccess, BlogController.getRecentBlogs.bind(BlogController))
      .get("/blogs/recommended", verifyAccess, BlogController.getRecommendedBlogs.bind(BlogController))
      .get("/blog-detail/:blogId", verifyAccess, BlogController.getBlogDetails.bind(BlogController))
      .get("/saved-blogs", verifyAccess, BlogController.getSavedBlogs.bind(BlogController))
router.post("/toggle-save-blog", verifyAccess, BlogController.toggleSaveBlog.bind(BlogController));

router.post("/profile", validate(createFoodieProfileSchema), verifyAccess, foodieController.createProfile.bind(foodieController))
router.put("/profile", validate(updateFoodieProfileSchema), verifyAccess, foodieController.updateProfile.bind(foodieController))
router.get("/profile", verifyAccess, foodieController.getProfile.bind(foodieController))

router.post("/foodspot", verifyAccess, FoodSpotController.createFoodSpot.bind(FoodSpotController))
router.put("/foodspot", verifyAccess, FoodSpotController.updateFoodSpot.bind(FoodSpotController))
router.get("/foodspot/recent", verifyAccess, FoodSpotController.getRecentFoodSpots.bind(FoodSpotController))
router.get("/foodspot/:id", verifyAccess, FoodSpotController.getFoodSpot.bind(FoodSpotController))
      .get('/nearby', verifyAccess, FoodSpotController.getNearByFoodSpots.bind(FoodSpotController))
      .get('/foodspots', verifyAccess, FoodSpotController.getAllFoodSpots.bind(FoodSpotController))
      .get('/myfoodspots', verifyAccess, FoodSpotController.getAllFoodSpotsByFoodie.bind(FoodSpotController))
      .get('/saved-foodspots', verifyAccess, FoodSpotController.getSavedFoodSpots.bind(FoodSpotController))
      .get('/wallet', verifyAccess, WalletController.foodieWallet.bind(WalletController))

router.post("/toggle-save-foodspot", verifyAccess, FoodSpotController.toggleSaveFoodSpot.bind(FoodSpotController));

router.get('/chefs', verifyAccess, ChefController.getAllChefs.bind(ChefController))
      .get('/chef/:id', verifyAccess, ChefController.getChefDetails.bind(ChefController))
      .get('/chef/:chefId/recipes', verifyAccess, RecipeController.getRecipesByChef.bind(RecipeController))
      .get('/chef/:chefId/blogs', verifyAccess, BlogController.getBlogsByChef.bind(BlogController))
      .get('/chef/:chefId/workshops', verifyAccess, WorkshopController.getWorkshopsByChefToFoodie.bind(WorkshopController));

export default router;