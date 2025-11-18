import { Container } from "inversify";
import { IChefController } from "../../controllers/interface/IChefController";
import TYPES from "../types";
import { ChefController } from "../../controllers/implementation/chef.controller";

export default function chefModule(container:Container){
    container.bind<IChefController>(TYPES.IChefController).to(ChefController)
}