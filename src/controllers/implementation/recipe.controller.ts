import { inject, injectable } from "inversify";
import { IRecipeController } from "../interface/IRecipeController";
import TYPES from "../../DI/types";
import { IRecipeService } from "../../services/interface/IRecipeService";
import { Request, Response, NextFunction } from "express";
import { log } from "../../utils/logger";
import { STATUS_CODE } from "../../constants/StatusCode";
import { AppError } from "../../utils/AppError";
import { MESSAGES, RECIPE_MESSAGES } from "../../constants/Message";

@injectable()
export class RecipeController implements IRecipeController {

    constructor(
        @inject(TYPES.IRecipeService) private _recipeService: IRecipeService,
    ) { }
    async addRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const recipeData = req.body;
            const chefId = req.user?.id;

            const result = await this._recipeService.createRecipe({ chefId, ...recipeData });
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: result.message })
        } catch (error) {
            next(error)
        }
    }
    async editRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log('reached edit recipe');

        try {
            const { recipeId, recipeData } = req.body
            console.log('id', recipeId);
            console.log('data', recipeData);

            const result = await this._recipeService.editRecipe(recipeId, recipeData)
            res.status(STATUS_CODE.SUCCESS).json({ success: true,  message: result.message })
        } catch (error) {
            next(error);
        }
    }
    async getAllRecipesChef(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            const page = Number(req.query.page) || 1
            const limit = Number(req.query.limit) || 5
            const search = String(req.query.search) || ""

            // if(!id)throw new AppError('user id is not found',STATUS_CODE.NOT_FOUND)
            const result = await this._recipeService.getAllRecipesChef(userId as string, page, limit, search);
            log.info('resldata:===========', result.data)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, currentPage: result.currentPage, totalPages: result.totalPages, message: result.message })
        } catch (error) {
            next(error)
        }
    }
    async getAllRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 5;
            const search = String(req.query.search) || "";
            const category = String(req.query.filter) || "" ;

            const result = await this._recipeService.getAllRecipes(page, limit, search, category)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result.datas, currentPage: result.currentPage, total: result.totalPage })
        } catch (error) {
            next(error)
        }
    }
    async getRecipeDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const recipeId = req.params.id
            const userId = req.user?.id
            if (!recipeId) throw new AppError(RECIPE_MESSAGES.RECIPEID_NOTFOUND, STATUS_CODE.NOT_FOUND)
            if (!userId) throw new AppError(MESSAGES.USER.USERID_NOTFOUND, STATUS_CODE.NOT_FOUND)
            const result = await this._recipeService.getRecipeDetail(recipeId, userId)
            console.log('recdetail==========', result)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, message: result.message })
        } catch (error) {
            next(error)
        }
    }
    async deletRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const id = req.params.id;
            if (!id) throw new AppError(RECIPE_MESSAGES.RECIPEID_NOTFOUND, STATUS_CODE.NOT_FOUND)
            const result = await this._recipeService.deleteRecipe(String(id))
            res.status(STATUS_CODE.SUCCESS).json({ message: result.message })
        } catch (error) {
            next(error);
        }
    }
    async getRelatedRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            log.info('reaching1')
            const cuisine = req.params.cuisine;
            console.log('cuisine:', cuisine);

            const restult = await this._recipeService.getRelatedRecipes(cuisine)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, relatedData: restult.datas, message: restult.message })
        } catch (error) {
            next(error)
        }
    }
    async toggleSaveRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id
            const { recipeId } = req.body;

            if (!userId) throw new AppError(MESSAGES.USER.USERID_NOTFOUND, STATUS_CODE.UNAUTHORIZED);


            const result = await this._recipeService.toggleSaveRecipe(userId, recipeId)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: result.message, isSaved: result.isSaved })
        } catch (error) {
            next(error)
        }
    }
    async unsaveRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            const { recipeId } = req.body;

            if (!userId) throw new AppError(MESSAGES.USER.USERID_NOTFOUND, STATUS_CODE.UNAUTHORIZED)

            await this._recipeService.unSaveRecipe(userId, recipeId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: RECIPE_MESSAGES.SAVED })
        } catch (error) {
            next(error);
        }
    }
    async getSavedRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED)

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 6;

            const result = await this._recipeService.getSavedRecipes(userId, page, limit)
            console.log('saved recipes========', result)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, currentPage: result.currentPage, totalPages: result.totalPages, message: RECIPE_MESSAGES.FETCH_SAVED })
        } catch (error) {
            next(error)
        }
    }

    async getRecipesByChef(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { chefId } = req.params;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 6;
            const search = String(req.query.search) || "";
            const result = await this._recipeService.getAllRecipesChef(chefId, page, limit, search);

            console.log('000000000', search);

            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                datas: result.data,
                totalCount: result.totalPages * limit,
                currentPage: result.currentPage,
                totalPages: result.totalPages
            });
        } catch (error) {
            next(error);
        }
    }
    async getRecentRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const limit = Number(req.query.limit) || 3;
            const result = await this._recipeService.getRecentRecipes(limit);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result.data, message: RECIPE_MESSAGES.RECENT_FETCHED });
        } catch (error) {
            next(error);
        }
    }
    async getRecommendedRecipes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) throw new AppError(MESSAGES.USER.USERID_NOTFOUND, STATUS_CODE.UNAUTHORIZED);
            const result = await this._recipeService.getRecommendedRecipes(userId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result.datas, message: result.message });
        } catch (error) {
            next(error);
        }
    }
}