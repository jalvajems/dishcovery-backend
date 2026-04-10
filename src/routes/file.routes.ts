import { Router } from "express";
import container from "../DI/inversify.config";
import { IFileController } from "../controllers/interface/IFileController";
import TYPES from "../DI/types";
import { verifyAccess } from "../middlewares/verifyAccess";

const router=Router();

const FileController=container.get<IFileController>(TYPES.IFileController);

router.post('/file-upload',FileController.signedUrl.bind(FileController))
router.get('/image/*', verifyAccess, FileController.serveImage.bind(FileController))


export default router;