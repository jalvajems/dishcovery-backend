import { NextFunction, Request, Response } from "express";

export interface IAdminController {
    getAllFoodies(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllChefs(req: Request, res: Response, next: NextFunction): Promise<void>;
    blockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    unBlockUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    verifyChef(req: Request, res: Response, next: NextFunction): Promise<void>;
    unVerifyChef(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllRecipes(req: Request, res: Response, next: NextFunction): Promise<void>;
    blockRecipe(req: Request, res: Response, next: NextFunction): Promise<void>;
    unBlockRecipe(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllBlogs(req: Request, res: Response, next: NextFunction): Promise<void>;
    blockBlog(req: Request, res: Response, next: NextFunction): Promise<void>;
    unBlockBlog(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllFoodSpots(req: Request, res: Response, next: NextFunction): Promise<void>;
    blockSpot(req: Request, res: Response, next: NextFunction): Promise<void>;
    unblockSpot(req: Request, res: Response, next: NextFunction): Promise<void>;
    approveSpot(req: Request, res: Response, next: NextFunction): Promise<void>;
    unApproveSpot(req: Request, res: Response, next: NextFunction): Promise<void>;
    getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void>;
    getGrowthData(req: Request, res: Response, next: NextFunction): Promise<void>;

}