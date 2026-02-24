import { Document, Types, FilterQuery } from "mongoose";
import { IRecipeDocument, RecipeModel } from "../../models/recipe.model";
import { IRecipe } from "../../types/recipe.types";
import { IRecipeRepository } from "../interface/IRecipeRepository";
import { BaseRepository } from "./base.repository";
import { error } from "console";

export class RecipeRepository extends BaseRepository<IRecipeDocument> implements IRecipeRepository {
    constructor() {
        super(RecipeModel);
    }
    async findRecipesById(
        id: string,
        skip: number,
        limit: number,
        search: string
    ): Promise<{ datas: IRecipeDocument[]; totalCount: number }> {

        const chefObjId = new Types.ObjectId(id);

        const query: FilterQuery<IRecipeDocument> = {
            $and: [
                { chefId: chefObjId }
            ]
        };

        console.log('recipes in repo1');
        if (search && search.trim() !== "") {
            query.$and!.push({
                $or: [
                    { title: new RegExp(search, "i") },
                    { cuisine: new RegExp(search, "i") },
                ]
            });
        }
        console.log('recipes in repo2', query);

        const recipes = await RecipeModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        console.log('recipes in repo', recipes);

        const totalCount = await RecipeModel.countDocuments(query);
        console.log('recipes in repo3', recipes);

        return { datas: recipes, totalCount };
    }

    async findAllByPagination(search: string, skip: number, limit: number, from: string, filter?: string): Promise<{ datas: IRecipeDocument[], totalCount: number }> {
        if (from == 'admin') {
            const query: FilterQuery<IRecipeDocument> = {};
            if (search) {
                query.$or = [
                    { title: new RegExp(search, "i") },
                    { cuisine: new RegExp(search, "i") },
                    { tags: new RegExp(search, "i") }
                ];
            }
            if (filter) {
                query.cuisine = filter;
            }
            const recipes = await RecipeModel.find(query).sort({ createdAt: -1 }).populate("chefId", "name ").skip(skip).limit(limit);

            const totalCount = await RecipeModel.countDocuments(query)
            return { datas: recipes, totalCount: totalCount }
        } else if (from == 'foodie') {
            const query: FilterQuery<IRecipeDocument> = {
                isBlock: false
            };
            if (search) {
                query.$or = [
                    { title: new RegExp(search, "i") },
                    { cuisine: new RegExp(search, "i") },
                    { tags: new RegExp(search, "i") }
                ];
            }
            if (filter) {
                query.cuisine = filter;
            }

            const recipes = await RecipeModel.find(query).sort({ createdAt: -1 }).populate("chefId", "name ").skip(skip).limit(limit);

            const totalCount = await RecipeModel.countDocuments(query)
            return { datas: recipes, totalCount: totalCount }
        } else {
            throw error;
        }
    }
    async blockById(id: string): Promise<IRecipe & Document | null> {
        return await RecipeModel.findByIdAndUpdate({ _id: id }, { $set: { isBlock: true } }, { new: true })
    }
    async unblockById(id: string): Promise<IRecipe & Document | null> {
        return await RecipeModel.findByIdAndUpdate({ _id: id }, { $set: { isBlock: false } }, { new: true })
    }
    async findByIdandPopulate(id: string): Promise<(IRecipe & Document) | null> {
        return await RecipeModel.findOne({ _id: id }, { isBlock: false }).populate("chefId", "name")
    }
    async findByCuisine(cuisine: string): Promise<IRecipeDocument[] | null> {
        return await RecipeModel.find({ cuisine: cuisine }, { isBlock: false })
    }
    async findRecent(limit: number): Promise<IRecipeDocument[]> {
        return await RecipeModel.find({ isBlock: false })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("chefId", "name");
    }

}
