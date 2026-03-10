import { Container } from "inversify";
import { IFileService } from "../../services/interface/IFileService";
import TYPES from "../types";
import { FileService } from "../../services/implementation/file.service";
import { IFileController } from "../../controllers/interface/IFileController";
import { FileController } from "../../controllers/implementation/file.controller";

export default function fileModule(container:Container){
    container.bind<IFileService>(TYPES.IFileService).to(FileService);
    container.bind<IFileController>(TYPES.IFileController).to(FileController)
}