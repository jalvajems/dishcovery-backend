import { Router } from 'express';
import container from '../DI/inversify.config';
import { IChefController } from '../controllers/interface/IChefController';
import TYPES from '../DI/types';
import { verifyAccess } from '../middlewares/verifyAccess';
const router = Router();

const chefController = container.get<IChefController>(TYPES.IChefController)
console.log('reach backend chef router');

router.get('/chef-dashboard', verifyAccess, chefController.getChefDashboard.bind(chefController))

export default router