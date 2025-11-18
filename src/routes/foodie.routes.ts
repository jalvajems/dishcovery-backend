import { Router } from 'express';
import container from '../DI/inversify.config';
import { IFoodieController } from '../controllers/interface/IFoodieController';
import TYPES from '../DI/types';
import { verifyAccess } from '../middlewares/verifyAccess';
const router = Router();

const foodieController = container.get<IFoodieController>(TYPES.IFoodieController);
router.get('/foodie-dashboard', verifyAccess, foodieController.getFoodieDashboard.bind(foodieController));
router.put('/edit-profile', foodieController.editFoodieProfile.bind(foodieController))

export default router;