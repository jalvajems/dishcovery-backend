import { NextFunction, Request, Response } from "express";

export interface IFoodSpotController {
    createFoodSpot(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFoodSpot(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateFoodSpot(req: Request, res: Response, next: NextFunction): Promise<void>;
    getNearByFoodSpots(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllFoodSpots(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllFoodSpotsByFoodie(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRecentFoodSpots(req: Request, res: Response, next: NextFunction): Promise<void>;
    toggleSaveFoodSpot(req: Request, res: Response, next: NextFunction): Promise<void>;
    getSavedFoodSpots(req: Request, res: Response, next: NextFunction): Promise<void>;
}

