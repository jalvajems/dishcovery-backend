import { Container } from "inversify";
import { IBlogRepository } from "../../repostories/interface/IBlogRepository";
import TYPES from "../types";
import { BlogRepository } from "../../repostories/implementation/blog.repository";
import { IBlogService } from "../../services/interface/IBlogService";
import { BlogService } from "../../services/implementation/blog.service";
import { IBlogController } from "../../controllers/interface/IBlogController";
import { BlogController } from "../../controllers/implementation/blog.controller";

export default function blogModule(container:Container){
    container.bind<IBlogRepository>(TYPES.IBlogRepository).to(BlogRepository),
    container.bind<IBlogService>(TYPES.IBlogService).to(BlogService),
    container.bind<IBlogController>(TYPES.IBlogController).to(BlogController)
}