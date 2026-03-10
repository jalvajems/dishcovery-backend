import { Container } from "inversify";
import TYPES from "../types";
import { IFoodSpotRepository } from "../../repostories/interface/IFoodSportRepository";
import { FoodSpotRepository } from "../../repostories/implementation/foodSpot.repository";
import { FoodSpotService } from "../../services/implementation/foodSpot.service";
import { IFoodSpotService } from "../../services/interface/IFoodSpotService";
import { IFoodSpotController } from "../../controllers/interface/IFoodSpotController";
import { FoodSpotController } from "../../controllers/implementation/foodSpot.controller";

export function foodSpotModule(container:Container){
    container.bind<IFoodSpotRepository>(TYPES.IFoodSpotRepository).to(FoodSpotRepository);
    container.bind<IFoodSpotService>(TYPES.IFoodSpotService).to(FoodSpotService);
    container.bind<IFoodSpotController>(TYPES.IFoodSpotController).to(FoodSpotController);
    
}