import { Container } from "inversify";
import TYPES from "../types";
import { IFollowRepository } from "../../repostories/interface/IFollowRepository";
import { FollowRepository } from "../../repostories/implementation/follow.repository";
import { IFollowService } from "../../services/interface/IFollowService";
import { FollowService } from "../../services/implementation/follow.service";
import { FollowController } from "../../controllers/implementation/follow.controller";

export const followModule = (container: Container) => {
    container.bind<IFollowRepository>(TYPES.IFollowRepository).to(FollowRepository);
    container.bind<IFollowService>(TYPES.IFollowService).to(FollowService);
    container.bind<FollowController>(TYPES.IFollowController).to(FollowController);
};
