import { Request, Response, NextFunction } from 'express';

export interface IWorkshopSessionController {
    startSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    endSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    joinSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    leaveSession(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSessionInfo(req: Request, res: Response, next: NextFunction): Promise<void>;
    getActiveSessions(req: Request, res: Response, next: NextFunction): Promise<void>;
}
