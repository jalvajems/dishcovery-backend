import { Request, Response, NextFunction } from 'express';

export interface IBookingController {
    bookWorkshop(req: Request, res: Response, Next: NextFunction): Promise<void>;
    getMyBookings(req: Request, res: Response, Next: NextFunction): Promise<void>;
    getParticipants(req: Request, res: Response, Next: NextFunction): Promise<void>;
    cancelBooking(req: Request, res: Response, Next: NextFunction): Promise<void>;
    handleWebhook(req: Request, res: Response, Next: NextFunction): Promise<void>;
    markAttendance(req: Request, res: Response, Next: NextFunction): Promise<void>;
}
