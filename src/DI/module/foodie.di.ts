import { Container } from "inversify";
import { IFoodieRepository } from "../../repostories/interface/IFoodieRepository";
import TYPES from "../types";
import { FoodieRepository } from "../../repostories/implementation/foodie.repository";
import { IFoodieService } from "../../services/interface/IFoodieService";
import { FoodieService } from "../../services/implementation/foodie.service";
import { IFoodieController } from "../../controllers/interface/IFoodieController";
import { FoodieController } from "../../controllers/implementation/foodie.controller";
import { log } from "console";


export function foodieModule(container:Container){
    container.bind<IFoodieRepository>(TYPES.IFoodieRepository).to(FoodieRepository);
    container.bind<IFoodieService>(TYPES.IFoodieService).to(FoodieService);
    container.bind<IFoodieController>(TYPES.IFoodieController).to(FoodieController);
}