import { Router } from 'express';
import container from '../DI/inversify.config';
import { IChefController } from '../controllers/interface/IChefController';
import TYPES from '../DI/types';
import { verifyAccess } from '../middlewares/verifyAccess';
import { IRecipeController } from '../controllers/interface/IRecipeController';
import { IBlogController } from '../controllers/interface/IBlogController';
import { validate } from '../middlewares/zod.middleware';
import { createChefProfileSchema, updateChefProfileSchema } from '../validations/chefProfileValidation';
import { createRecipeSchema, editRecipeRequestSchema, updateRecipeSchema } from '../validations/recipeValidation';
import { createBlogSchema, updateBlogSchema } from '../validations/blogValidation';
import { isVerifyChef } from '../middlewares/isVerifyChef';
const router = Router();

const chefController = container.get<IChefController>(TYPES.IChefController)
const recipeController = container.get<IRecipeController>(TYPES.IRecipeController)
const BlogController = container.get<IBlogController>(TYPES.IBlogController)

console.log('reach router');

router.get('/dashboard', verifyAccess, isVerifyChef, chefController.getChefDashboard.bind(chefController))
      .get('/profile', verifyAccess, chefController.getProfile.bind(chefController))
router.post("/profile", validate(createChefProfileSchema), verifyAccess, chefController.createProfile.bind(chefController))
router.put("/profile-edit", validate(updateChefProfileSchema), verifyAccess, chefController.updateProfile.bind(chefController))

      .get('/recipes-list', verifyAccess, isVerifyChef, recipeController.getAllRecipesChef.bind(recipeController))
      .get('/recipe-detail/:id', verifyAccess, isVerifyChef, recipeController.getRecipeDetail.bind(recipeController))
router.post('/recipe-add', validate(createRecipeSchema), verifyAccess, isVerifyChef, recipeController.addRecipe.bind(recipeController))
router.put('/recipe-edit', validate(editRecipeRequestSchema), verifyAccess, isVerifyChef, recipeController.editRecipe.bind(recipeController))
router.delete('/recipe-delete/:id', verifyAccess, isVerifyChef, recipeController.deletRecipe.bind(recipeController))

router.post('/blog-add', validate(createBlogSchema), verifyAccess, BlogController.createBlog.bind(BlogController))
router.patch('/blog-edit/:id', validate(updateBlogSchema), verifyAccess, BlogController.updateBlog.bind(BlogController))
router.delete('/blog-delete/:blogId', verifyAccess, BlogController.deletBlog.bind(BlogController))
router.get('/blog-details/:blogId', verifyAccess, BlogController.getBlogDetails.bind(BlogController))
      .get('/blog-listing', verifyAccess, BlogController.getMyBlogs.bind(BlogController))

export default router