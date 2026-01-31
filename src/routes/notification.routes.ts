import { Router } from "express";
import container from "../DI/inversify.config";
import TYPES from "../DI/types";
import { INotificationController } from "../controllers/interface/INotificationController";
import { verifyAccess } from "../middlewares/verifyAccess";

const router = Router();
const notificationController = container.get<INotificationController>(TYPES.INotificationController);

router.get("/", verifyAccess, notificationController.getUserNotifications.bind(notificationController));
router.get("/unread-count", verifyAccess, notificationController.getUnreadCount.bind(notificationController));
router.patch("/:id/read", verifyAccess, notificationController.markAsRead.bind(notificationController));
router.patch("/read-all", verifyAccess, notificationController.markAllAsRead.bind(notificationController));
router.delete("/", verifyAccess, notificationController.deleteAll.bind(notificationController));

export default router;
