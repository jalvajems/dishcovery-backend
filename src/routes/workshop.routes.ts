import { Router } from 'express';
import container from '../DI/inversify.config';
import { IWorkshopController } from '../controllers/interface/IWorkshopController';
import TYPES from '../DI/types';
import { verifyAccess } from '../middlewares/verifyAccess';
import { authorizeRole } from '../middlewares/authorizeRole';
import { validate } from '../middlewares/zod.middleware';
import { createWorkshopSchema, updateWorkshopSchema, rejectionSchema } from '../validations/workshopValidation';
import { isVerifyChef } from '../middlewares/isVerifyChef';

const router = Router();
const workshopController = container.get<IWorkshopController>(TYPES.IWorkshopController);

// Chef Routes
router.post('/chef', verifyAccess, isVerifyChef, validate(createWorkshopSchema), workshopController.createWorkshop.bind(workshopController));
router.put('/chef/:id', verifyAccess, isVerifyChef, validate(updateWorkshopSchema), workshopController.updateWorkshop.bind(workshopController));
router.get('/chef', verifyAccess, isVerifyChef, workshopController.getChefWorkshops.bind(workshopController));
router.patch('/chef/:id/submit', verifyAccess, isVerifyChef, workshopController.submitWorkshop.bind(workshopController));
router.post('/chef/:id/start', verifyAccess, isVerifyChef, workshopController.startWorkshop.bind(workshopController));
router.post('/chef/:id/end', verifyAccess, isVerifyChef, workshopController.endWorkshop.bind(workshopController));

// Admin Routes
router.get('/admin', verifyAccess, authorizeRole('admin'), workshopController.getAllWorkshops.bind(workshopController));
router.patch('/admin/:id/approve', verifyAccess, authorizeRole('admin'), workshopController.approveWorkshop.bind(workshopController));
router.patch('/admin/:id/reject', verifyAccess, authorizeRole('admin'), validate(rejectionSchema), workshopController.rejectWorkshop.bind(workshopController));

// Shared/Public/Foodie Routes
router.get('/approved', workshopController.getApprovedWorkshops.bind(workshopController));
router.get('/:id', workshopController.getWorkshopById.bind(workshopController));

export default router;
