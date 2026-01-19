import { Router } from "express";
import container from "../DI/inversify.config";
import TYPES from "../DI/types";
import { IWorkshopSessionController } from "../controllers/interface/IWorkshopSessionController";
import { verifyAccess } from "../middlewares/verifyAccess";
import { authorizeRole } from "../middlewares/authorizeRole";

const router = Router();
const controller = container.get<IWorkshopSessionController>(TYPES.WorkshopSessionController);

// Chef Routes
router.post('/:workshopId/start', verifyAccess, authorizeRole('chef'), controller.startSession.bind(controller));
router.post('/:workshopId/end', verifyAccess, authorizeRole('chef'), controller.endSession.bind(controller));

// Foodie Routes
router.post('/:workshopId/join', verifyAccess, authorizeRole('foodie'), controller.joinSession.bind(controller));
router.post('/:workshopId/leave', verifyAccess, authorizeRole('foodie'), controller.leaveSession.bind(controller));

// Admin Routes
router.get('/admin/active', verifyAccess, authorizeRole('admin'), controller.getActiveSessions.bind(controller));

// Common
router.get('/:workshopId/info', verifyAccess, controller.getSessionInfo.bind(controller));

export default router;
