import { Router } from 'express';
import container from '../DI/inversify.config';
import { IChefController } from '../controllers/interface/IChefController';
import TYPES from '../DI/types';
import { verifyAccess } from '../middlewares/verifyAccess';
import { IRecipeController } from '../controllers/interface/IRecipeController';
const router = Router();

const chefController = container.get<IChefController>(TYPES.IChefController)
const recipeController = container.get<IRecipeController>(TYPES.IRecipeController)

router.get('/dashboard', verifyAccess, chefController.getChefDashboard.bind(chefController))
      .get('/recipes-list', recipeController.getAllRecipes.bind(recipeController))
      .get('/recipe-detail/:id',recipeController.getRecipeDetail.bind(recipeController))
      
router.post('/recipe-add', recipeController.addRecipe.bind(recipeController))
router.put('/recipe-edit', recipeController.editRecipe.bind(recipeController))
router.delete('/recipe-delete/:id',recipeController.deletRecipe.bind(recipeController))

export default router