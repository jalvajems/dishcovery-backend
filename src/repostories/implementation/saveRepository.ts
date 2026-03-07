import { IUserDocument, UserModel } from "../../models/users.model";
import { ISaveRepository } from "../interface/ISaveRepository";
import { BaseRepository } from "./base.repository";

export class SaveRepository extends BaseRepository<IUserDocument> implements ISaveRepository {
    constructor() {
        super(UserModel)
    }
    async saveRecipe(id: string, recipeId: string): Promise<void> {
        await UserModel.updateOne({ _id: id }, { $addToSet: { savedRecipes: recipeId } })
    }
    async unSaveRecipe(id: string, recipeId: string): Promise<void> {
        await UserModel.updateOne({ _id: id }, { $pull: { savedRecipes: recipeId } })
    }
    async getSavedRecipes(id: string, skip: number, limit: number): Promise<{ datas: IUserDocument | null; totalCount: number }> {
        const user = await UserModel.findById(id);
        const totalCount = user?.savedRecipes?.length || 0;

        const result = await UserModel.findById(id)
            .select("savedRecipes")
            .populate({
                path: "savedRecipes",
                options: { skip, limit }
            });

        console.log('result in repo recip', result);

        return { datas: result, totalCount };
    }

    async saveBlog(id: string, blogId: string): Promise<void> {
        await UserModel.updateOne({ _id: id }, { $addToSet: { savedBlogs: blogId } });
    }

    async unSaveBlog(id: string, blogId: string): Promise<void> {
        await UserModel.updateOne({ _id: id }, { $pull: { savedBlogs: blogId } });
    }

    async getSavedBlogs(id: string, skip: number, limit: number): Promise<{ datas: IUserDocument | null; totalCount: number }> {
        const user = await UserModel.findById(id);
        const totalCount = user?.savedBlogs?.length || 0;

        const result = await UserModel.findById(id)
            .select("savedBlogs")
            .populate({
                path: "savedBlogs",
                options: { skip, limit }
            });

        return { datas: result, totalCount };
    }

    async saveFoodSpot(id: string, foodSpotId: string): Promise<void> {
        await UserModel.updateOne({ _id: id }, { $addToSet: { savedFoodSpots: foodSpotId } });
    }

    async unSaveFoodSpot(id: string, foodSpotId: string): Promise<void> {
        await UserModel.updateOne({ _id: id }, { $pull: { savedFoodSpots: foodSpotId } });
    }

    async getSavedFoodSpots(id: string, skip: number, limit: number): Promise<{ datas: IUserDocument | null; totalCount: number }> {
        const user = await UserModel.findById(id);
        const totalCount = user?.savedFoodSpots?.length || 0;

        const result = await UserModel.findById(id)
            .select("savedFoodSpots")
            .populate({
                path: "savedFoodSpots",
                options: { skip, limit }
            });

        return { datas: result, totalCount };
    }
}