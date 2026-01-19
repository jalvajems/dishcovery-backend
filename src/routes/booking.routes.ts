import { Router } from 'express';
import container from '../DI/inversify.config';
import { IBookingController } from '../controllers/interface/IBookingController';
import TYPES from '../DI/types';
import { verifyAccess } from '../middlewares/verifyAccess';
import { authorizeRole } from '../middlewares/authorizeRole';
import express from 'express';

const router = Router();
const webhookRouter = Router();
const bookingController = container.get<IBookingController>(TYPES.IBookingController);

// Webhook Router - Mount this BEFORE express.json() in app.ts
webhookRouter.post('/webhook', express.raw({ type: 'application/json' }), bookingController.handleWebhook.bind(bookingController));

// Foodie Routes
router.post('/:id/book', verifyAccess, authorizeRole('user'), bookingController.bookWorkshop.bind(bookingController));
router.get('/my-bookings', verifyAccess, authorizeRole('user'), bookingController.getMyBookings.bind(bookingController));
router.patch('/:id/cancel', verifyAccess, authorizeRole('user'), bookingController.cancelBooking.bind(bookingController));

// Chef Routes
router.get('/workshop/:id/participants', verifyAccess, authorizeRole('chef'), bookingController.getParticipants.bind(bookingController));

export { webhookRouter };
export default router;
