import { Container } from "inversify";
import { IRecipeRepository } from "../../repostories/interface/IRecipeRepository";
import TYPES from "../types";
import { RecipeRepository } from "../../repostories/implementation/recipe.repsitory";
import { IRecipeService } from "../../services/interface/IRecipeService";
import { RecipeService } from "../../services/implementation/recipe.service";
import { IRecipeController } from "../../controllers/interface/IRecipeController";
import { RecipeController } from "../../controllers/implementation/recipe.controller";

export default function recipeModule(container:Container){
    container.bind<IRecipeRepository>(TYPES.IRecipeRepository).to(RecipeRepository);
    container.bind<IRecipeService>(TYPES.IRecipeService).to(RecipeService);
    container.bind<IRecipeController>(TYPES.IRecipeController).to(RecipeController);
}