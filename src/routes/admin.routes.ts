import { Router } from 'express';
import { verifyAccess } from '../middlewares/verifyAccess';
import { authorizeRole } from '../middlewares/authorizeRole';
import container from '../DI/inversify.config';
import { IAdminController } from '../controllers/interface/IAdminController';
import TYPES from '../DI/types';
import { Role } from '../types/user.types';

const router = Router();

const adminController = container.get<IAdminController>(TYPES.IAdminController);

router.get('/foodie-management', authorizeRole(Role.ADMIN), verifyAccess, adminController.getAllFoodies.bind(adminController))
      .get('/chef-management', authorizeRole(Role.ADMIN), verifyAccess, adminController.getAllChefs.bind(adminController))
      .get('/recipe-management', authorizeRole(Role.ADMIN), adminController.getAllRecipes.bind(adminController))
      .get('/blog-management', authorizeRole(Role.ADMIN), adminController.getAllBlogs.bind(adminController))
      .get('/foodspot-management', authorizeRole(Role.ADMIN), adminController.getAllFoodSpots.bind(adminController))
      .get('/dashboard-stats', authorizeRole(Role.ADMIN), adminController.getDashboardStats.bind(adminController))
      .get('/growth-data', authorizeRole(Role.ADMIN), adminController.getGrowthData.bind(adminController))

router.patch('/toggle-block/:id', authorizeRole(Role.ADMIN), adminController.blockUser.bind(adminController))
      .patch('/toggle-unblock/:id', authorizeRole(Role.ADMIN), adminController.unBlockUser.bind(adminController))
      .patch('/toggle-verify/:id', authorizeRole(Role.ADMIN), adminController.verifyChef.bind(adminController))
      .patch('/toggle-unVerify/:id', authorizeRole(Role.ADMIN), adminController.unVerifyChef.bind(adminController))
      .patch('/recipe-block/:id', authorizeRole(Role.ADMIN), adminController.blockRecipe.bind(adminController))
      .patch('/recipe-unblock/:id', authorizeRole(Role.ADMIN), adminController.unBlockRecipe.bind(adminController))
      .patch('/blog-block/:id', authorizeRole(Role.ADMIN), adminController.blockBlog.bind(adminController))
      .patch('/blog-unblock/:id', authorizeRole(Role.ADMIN), adminController.unBlockBlog.bind(adminController))
      .patch('/foodspot-block/:id', authorizeRole(Role.ADMIN), adminController.blockSpot.bind(adminController))
      .patch('/foodspot-unblock/:id', authorizeRole(Role.ADMIN), adminController.unblockSpot.bind(adminController))
      .patch('/foodspot-approve/:id', authorizeRole(Role.ADMIN), adminController.approveSpot.bind(adminController))
      .patch('/foodspot-unapprove/:id', authorizeRole(Role.ADMIN), adminController.unApproveSpot.bind(adminController))

export default router;