import { IUserDocument } from "../../models/users.model";
import { IBaseRepository } from "./IBaseRepository";

export interface ISaveRepository extends IBaseRepository<IUserDocument> {
    saveRecipe(id: string, recipeId: string): Promise<void>;
    unSaveRecipe(id: string, recipeId: string): Promise<void>;
    getSavedRecipes(id: string, skip: number, limit: number): Promise<{ datas: IUserDocument | null; totalCount: number }>;

    saveBlog(id: string, blogId: string): Promise<void>;
    unSaveBlog(id: string, blogId: string): Promise<void>;
    getSavedBlogs(id: string, skip: number, limit: number): Promise<{ datas: IUserDocument | null; totalCount: number }>;

    saveFoodSpot(id: string, foodSpotId: string): Promise<void>;
    unSaveFoodSpot(id: string, foodSpotId: string): Promise<void>;
    getSavedFoodSpots(id: string, skip: number, limit: number): Promise<{ datas: IUserDocument | null; totalCount: number }>;
}