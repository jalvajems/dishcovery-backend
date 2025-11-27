import { Document } from "mongoose";
import { IRecipeDocument, RecipeModel } from "../../models/recipe.model";
import { IRecipe } from "../../types/recipe.types";
import { IRecipeRepository } from "../interface/IRecipeRepository";
import { BaseRepository } from "./base.repository";

export class RecipeRepository extends BaseRepository<IRecipeDocument> implements IRecipeRepository {
    constructor() {
        super(RecipeModel);
    }
    async findRecipesById(id: string, skip: number, limit: number,search:string): Promise<{datas:IRecipeDocument[],totalCount:number}> {

        const query:any={chefId: id};
        if(search){
            query.$or=[
                { title: new RegExp(search, "i") },
                { cuisine: new RegExp(search, "i") },
                { tags: new RegExp(search, "i") }
            ];
        }
        const recipes=await RecipeModel.find(query).skip(skip).limit(limit)
        const totalCount=await RecipeModel.countDocuments(query)
        return {datas:recipes,totalCount:totalCount}
    }
    async findAllByPagination(search: string, skip: number, limit: number): Promise<{datas:IRecipeDocument[],totalCount:number}> {
        const query: any = {};
        if (search) {
            query.$or = [
                { title: new RegExp(search, "i") },
                { cuisine: new RegExp(search, "i") },
                { tags: new RegExp(search, "i") }
            ];
        }
        const recipes=await RecipeModel.find(query).skip(skip).limit(limit);
        const totalCount=await RecipeModel.countDocuments(query)
        return {datas:recipes,totalCount:totalCount}
    }
    async blockById(id: string): Promise<IRecipe & Document | null> {
        return await RecipeModel.findByIdAndUpdate({ _id: id }, { $set: { isBlock: true } }, { new: true })
    }
    async unblockById(id: string): Promise<IRecipe & Document | null> {
        return await RecipeModel.findByIdAndUpdate({ _id: id }, { $set: { isBlock: false } }, { new: true })
    }
    async findByIdandPopulate(id: string): Promise<(IRecipe & Document) | null> {
        return await RecipeModel.findById(id).populate("chefId", "name")
    }
    async findByCuisine(cuisine: string): Promise<IRecipeDocument[] | null> {
        return await RecipeModel.find({ cuisine: cuisine })
    }
}
