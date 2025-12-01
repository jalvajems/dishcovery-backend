import { Router } from 'express';
import container from '../DI/inversify.config';
import { IChefController } from '../controllers/interface/IChefController';
import TYPES from '../DI/types';
import { verifyAccess } from '../middlewares/verifyAccess';
import { IRecipeController } from '../controllers/interface/IRecipeController';
import { IBlogController } from '../controllers/interface/IBlogController';
const router = Router();

const chefController = container.get<IChefController>(TYPES.IChefController)
const recipeController = container.get<IRecipeController>(TYPES.IRecipeController)
const BlogController=container.get<IBlogController>(TYPES.IBlogController)

console.log('reach router');

router.get('/dashboard', verifyAccess, chefController.getChefDashboard.bind(chefController))
.get('/profile',verifyAccess,chefController.getProfile.bind(chefController))
router.post("/profile",verifyAccess,chefController.createProfile.bind(chefController))
router.put("/profile-edit",verifyAccess,chefController.updateProfile.bind(chefController))

      .get('/recipes-list', recipeController.getAllRecipesChef.bind(recipeController))
      .get('/recipe-detail/:id',recipeController.getRecipeDetail.bind(recipeController))
router.post('/recipe-add', recipeController.addRecipe.bind(recipeController))
router.put('/recipe-edit', recipeController.editRecipe.bind(recipeController))
router.delete('/recipe-delete/:id',recipeController.deletRecipe.bind(recipeController))

router.post('/blog-add',verifyAccess,BlogController.createBlog.bind(BlogController))
router.patch('/blog-edit/:id',verifyAccess,BlogController.updateBlog.bind(BlogController))
router.delete('/blog-delete/:blogId',verifyAccess,BlogController.deletBlog.bind(BlogController))
router.get('/blog-details/:blogId',verifyAccess,BlogController.getBlogDetails.bind(BlogController))
      .get('/blog-listing',verifyAccess,BlogController.getMyBlogs.bind(BlogController))

export default router