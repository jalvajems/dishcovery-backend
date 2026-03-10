import { Document } from "mongoose";
import { IRecipe } from "../../types/recipe.types";
import { IRecipeDto } from "../../dtos/recipe.dtos";

export function recipeMapper(recipe:IRecipe&Document ):IRecipeDto{
    const obj=recipe.toObject()
    return{
        chefId:obj.chefId.toString(),
        _id:obj._id.toString(),
        title:obj.title,
        cuisine:obj.cuisine,
        cookingTime:obj.cookingTime,
        tags:obj.tags,
        dietType:obj.dietType,
        ingredients:obj.ingredients,
        steps:obj.steps,
        images:obj.images,
        isDraft:obj.isDraft,
        isBlock:obj.isBlock,
    }
}