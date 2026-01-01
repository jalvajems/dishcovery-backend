import { Router } from 'express';
import { verifyAccess } from '../middlewares/verifyAccess';
import { authorizeRole } from '../middlewares/authorizeRole';
import container from '../DI/inversify.config';
import { IAdminController } from '../controllers/interface/IAdminController';
import TYPES from '../DI/types';
const router = Router();

const adminController = container.get<IAdminController>(TYPES.IAdminController);
router.get('/foodie-management',authorizeRole('admin'),verifyAccess, adminController.getAllFoodies.bind(adminController))
      .get('/chef-management',authorizeRole('admin'),verifyAccess, adminController.getAllChefs.bind(adminController))
      .get('/recipe-management',authorizeRole('admin'),adminController.getAllRecipes.bind(adminController))
      .get('/blog-management',authorizeRole('admin'),adminController.getAllBlogs.bind(adminController))
      .get('/foodspot-management',authorizeRole('admin'),adminController.getAllFoodSpots.bind(adminController))

router.patch('/toggle-block/:id',authorizeRole('admin'), adminController.blockUser.bind(adminController))
      .patch('/toggle-unblock/:id',authorizeRole('admin'),  adminController.unBlockUser.bind(adminController))
      .patch('/toggle-verify/:id',authorizeRole('admin'),  adminController.verifyChef.bind(adminController))
      .patch('/toggle-unVerify/:id',authorizeRole('admin'), adminController.unVerifyChef.bind(adminController))
     .patch('/recipe-block/:id',authorizeRole('admin'),adminController.blockRecipe.bind(adminController))
      .patch('/recipe-unblock/:id',authorizeRole('admin'),adminController.unBlockRecipe.bind(adminController))
      .patch('/blog-block/:id',authorizeRole('admin'),adminController.blockBlog.bind(adminController))
      .patch('/blog-unblock/:id',authorizeRole('admin'),adminController.unBlockBlog.bind(adminController))
      .patch('/foodspot-block/:id',authorizeRole('admin'),adminController.blockSpot.bind(adminController))
      .patch('/foodspot-unblock/:id',authorizeRole('admin'),adminController.unblockSpot.bind(adminController))
      .patch('/foodspot-approve/:id',authorizeRole('admin'),adminController.approveSpot.bind(adminController))
      .patch('/foodspot-unapprove/:id',authorizeRole('admin'),adminController.unApproveSpot.bind(adminController))

export default router;