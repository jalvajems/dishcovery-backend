import { Document } from "mongoose";
import { IRecipe } from "../../types/recipe.types";
import { IRecipeDto } from "../../dtos/recipe.dtos";
import { recipeMapper } from "./recipe.mapper";

export function allRecipesMapper(recipes:(IRecipe&Document)[]):IRecipeDto[]{
    return recipes.map(recipe=>recipeMapper(recipe))
}