import { Router } from 'express';
import { verifyAccess } from '../middlewares/verifyAccess';
import { authorizeRole } from '../middlewares/authorizeRole';
import container from '../DI/inversify.config';
import { IAdminController } from '../controllers/interface/IAdminController';
import TYPES from '../DI/types';
const router = Router();

const adminController = container.get<IAdminController>(TYPES.IAdminController);
router.get('/foodie-management',verifyAccess, adminController.getAllFoodies.bind(adminController))
      .get('/chef-management',verifyAccess, adminController.getAllChefs.bind(adminController));
router.patch('/toggle-block/:id', adminController.blockUser.bind(adminController))
      .patch('/toggle-unblock/:id',  adminController.unBlockUser.bind(adminController))
      .patch('/toggle-verify/:id',  adminController.verifyChef.bind(adminController))
      .patch('/toggle-unVerify/:id', adminController.unVerifyChef.bind(adminController))

export default router;