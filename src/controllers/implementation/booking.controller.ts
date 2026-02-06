import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'inversify';
import TYPES from '../../DI/types';
import { IBookingController } from '../interface/IBookingController';
import { IBookingService } from '../../services/interface/IBookingService';
import { STATUS_CODE } from '../../constants/StatusCode';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';

@injectable()
export class BookingController implements IBookingController {
    constructor(
        @inject(TYPES.IBookingService) private _bookingService: IBookingService
    ) { }

    async bookWorkshop(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const foodieId = req.user?.id;
            const { id: workshopId } = req.params;
            if (!foodieId) throw new AppError('Unauthorized', STATUS_CODE.UNAUTHORIZED);

            const result = await this._bookingService.createBooking(workshopId, foodieId);

            res.status(STATUS_CODE.CREATED).json({
                success: true,
                data: result.booking,
                clientSecret: result.clientSecret,
                message: result.clientSecret ? 'Payment required' : 'Booking confirmed'
            });
        } catch (error) {
            next(error);
        }
    }

    async getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const foodieId = req.user?.id;
            if (!foodieId) throw new AppError('Unauthorized', STATUS_CODE.UNAUTHORIZED);

            const bookings = await this._bookingService.getMyBookings(foodieId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: bookings });
        } catch (error) {
            next(error);
        }
    }

    async getParticipants(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId = req.user?.id;
            const { id: workshopId } = req.params;
            if (!chefId) throw new AppError('Unauthorized', STATUS_CODE.UNAUTHORIZED);

            const participants = await this._bookingService.getWorkshopParticipants(workshopId, chefId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: participants });
        } catch (error) {
            next(error);
        }
    }

    async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const foodieId = req.user?.id;
            const { id: bookingId } = req.params;
            if (!foodieId) throw new AppError('Unauthorized', STATUS_CODE.UNAUTHORIZED);

            await this._bookingService.cancelBooking(bookingId, foodieId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: 'Booking cancelled successfully' });
        } catch (error) {
            next(error);
        }
    }

    async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const sig = req.headers['stripe-signature'];
            logger.info(`Webhook received. Signature present: ${!!sig}`);

            if (!sig) {
                logger.error('Missing stripe signature');
                throw new AppError('Missing stripe signature', 400);
            }

            await this._bookingService.handleStripeWebhook(req.body, sig as string);
            logger.info('Webhook processed successfully');
            res.status(STATUS_CODE.SUCCESS).json({ received: true });
        } catch (error) {
            logger.error(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown Error'}`, { stack: error instanceof Error ? error.stack : undefined });
            console.error('Webhook Error:', error);
            res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown Error'}`);
        }
    }

    async markAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId = req.user?.id;
            const { id: bookingId } = req.params;
            const { status } = req.body;

            if (!chefId) throw new AppError('Unauthorized', STATUS_CODE.UNAUTHORIZED);
            if (!status) throw new AppError('Status is required', STATUS_CODE.BAD_REQUEST);

            const booking = await this._bookingService.markAttendance(bookingId, status);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: booking, message: 'Attendance updated' });
        } catch (error) {
            next(error);
        }
    }
}
