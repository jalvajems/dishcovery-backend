import { Container } from "inversify";
import { IChefController } from "../../controllers/interface/IChefController";
import TYPES from "../types";
import { ChefController } from "../../controllers/implementation/chef.controller";
import { IChefRepository } from "../../repostories/interface/IChefRepository";
import { ChefRepository } from "../../repostories/implementation/chef.repository";
import { IChefService } from "../../services/interface/IChefService";
import { ChefService } from "../../services/implementation/chef.service";

export default function chefModule(container:Container){
    container.bind<IChefController>(TYPES.IChefController).to(ChefController),
    container.bind<IChefRepository>(TYPES.IChefRepository).to(ChefRepository),
    container.bind<IChefService>(TYPES.IChefService).to(ChefService)
}