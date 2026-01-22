import { Request, Response, NextFunction } from 'express';

export interface IWorkshopController {
    createWorkshop(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateWorkshop(req: Request, res: Response, next: NextFunction): Promise<void>;
    getWorkshopById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getChefWorkshops(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllWorkshops(req: Request, res: Response, next: NextFunction): Promise<void>;
    getApprovedWorkshops(req: Request, res: Response, next: NextFunction): Promise<void>;
    approveWorkshop(req: Request, res: Response, next: NextFunction): Promise<void>;
    rejectWorkshop(req: Request, res: Response, next: NextFunction): Promise<void>;
    startWorkshop(req: Request, res: Response, next: NextFunction): Promise<void>;
    endWorkshop(req: Request, res: Response, next: NextFunction): Promise<void>;
    submitWorkshop(req: Request, res: Response, next: NextFunction): Promise<void>;
    getWorkshopsByChef(req: Request, res: Response, next: NextFunction): Promise<void>;
}
