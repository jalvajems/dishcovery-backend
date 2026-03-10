import { Router } from "express";
import container from "../DI/inversify.config";
import TYPES from "../DI/types";
import { IWorkshopSessionController } from "../controllers/interface/IWorkshopSessionController";
import { verifyAccess } from "../middlewares/verifyAccess";
import { authorizeRole } from "../middlewares/authorizeRole";
import { Role } from "../types/user.types";

const router = Router();
const controller = container.get<IWorkshopSessionController>(TYPES.WorkshopSessionController);

router.post('/:workshopId/start', verifyAccess, controller.startSession.bind(controller));
router.post('/:workshopId/end', verifyAccess, controller.endSession.bind(controller));

router.post('/:workshopId/join', verifyAccess, controller.joinSession.bind(controller));
router.post('/:workshopId/leave', verifyAccess, controller.leaveSession.bind(controller));

router.get('/admin/active', verifyAccess, authorizeRole(Role.ADMIN), controller.getActiveSessions.bind(controller));

router.get('/:workshopId/info', verifyAccess, controller.getSessionInfo.bind(controller));

export default router;
