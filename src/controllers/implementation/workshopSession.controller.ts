import { injectable, inject } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import TYPES from '../../DI/types';
import { IWorkshopSessionController } from '../interface/IWorkshopSessionController';
import { IWorkshopSessionService } from '../../services/interface/IWorkshopSessionService';
import { STATUS_CODE } from '../../constants/StatusCode';
import { AppError } from '../../utils/AppError';
import { MESSAGES, WORKSHOP_MESSAGES } from '../../constants/Message';

@injectable()
export class WorkshopSessionController implements IWorkshopSessionController {
    constructor(
        @inject(TYPES.WorkshopSessionService) private _sessionService: IWorkshopSessionService
    ) { }

    async startSession(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('reached start session==============');
            
            const { workshopId } = req.params;
            const chefId = req.user?.id;
            if (!chefId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);

            const session = await this._sessionService.startSession(workshopId, chefId);
            res.status(STATUS_CODE.CREATED).json({
                success: true,
                message:WORKSHOP_MESSAGES.SESSION_STARTED,
                data: session
            });
        } catch (error) {
            next(error);
        }
    }

    async endSession(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { workshopId } = req.params;
            const chefId = req.user?.id;
            if (!chefId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);

            await this._sessionService.endSession(workshopId, chefId);
            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                message: WORKSHOP_MESSAGES.SESSION_ENDED
            });
        } catch (error) {
            next(error);
        }
    }

    async joinSession(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { workshopId } = req.params;
            const foodieId = req.user?.id;
            if (!foodieId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);

            const result = await this._sessionService.joinSession(workshopId, foodieId);
            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                message:WORKSHOP_MESSAGES.JOINED_SESSION,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async leaveSession(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { workshopId } = req.params;
            const foodieId = req.user?.id;
            if (!foodieId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED);

            await this._sessionService.leaveSession(workshopId, foodieId);
            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                message: WORKSHOP_MESSAGES.LEFT_SESSION
            });
        } catch (error) {
            next(error);
        }
    }

    async getSessionInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { workshopId } = req.params;
            const session = await this._sessionService.getSessionInfo(workshopId);
            console.log('---------',session);
            
            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                data: session
            });
        } catch (error) {
            next(error);
        }
    }

    async getActiveSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const sessions = await this._sessionService.getActiveSessions();
            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                data: sessions
            });

            
        } catch (error) {
            next(error);
        }
    }
}
