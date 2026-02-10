import { Router } from 'express';
import container from '../DI/inversify.config';
import { IBookingController } from '../controllers/interface/IBookingController';
import TYPES from '../DI/types';
import { verifyAccess } from '../middlewares/verifyAccess';
import { authorizeRole } from '../middlewares/authorizeRole';
import express from 'express';
import { Role } from '../types/user.types';

const router = Router();
const webhookRouter = Router();
const bookingController = container.get<IBookingController>(TYPES.IBookingController);

webhookRouter.post('/webhook', express.raw({ type: 'application/json' }), bookingController.handleWebhook.bind(bookingController));

router.post('/:id/book', verifyAccess, authorizeRole(Role.USER), bookingController.bookWorkshop.bind(bookingController));
router.get('/my-bookings', verifyAccess, authorizeRole(Role.USER), bookingController.getMyBookings.bind(bookingController));
router.patch('/:id/cancel', verifyAccess, authorizeRole(Role.USER), bookingController.cancelBooking.bind(bookingController));

router.get('/workshop/:id/participants', verifyAccess, authorizeRole(Role.CHEF), bookingController.getParticipants.bind(bookingController));
router.patch('/:id/attendance', verifyAccess, authorizeRole(Role.CHEF), bookingController.markAttendance.bind(bookingController));

export { webhookRouter };
export default router;
