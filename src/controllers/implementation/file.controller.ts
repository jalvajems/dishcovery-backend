import { Request, Response, NextFunction } from "express";
import { IFileController } from "../interface/IFileController";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { FileService } from "../../services/implementation/file.service";
import { STATUS_CODE } from "../../constants/StatusCode";
import { S3_MESSAGES } from "../../constants/Message";

@injectable()
export class FileController implements IFileController {
    constructor(
        @inject(TYPES.IFileService) private _fileService: FileService,
    ) { }
    async signedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { fileName, fileType } = req.body;
            const result = await this._fileService.getSignedUrl(fileName, fileType);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result, message: S3_MESSAGES.S3URL_SEND })
        } catch (error) {
            next(error)
        }
    }

    async serveImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const key = (req.params as any)[0]; // Extract the full path after /image/
            if (!key) {
                res.status(STATUS_CODE.NOT_FOUND).json({ success: false, message: "Image not found" });
                return;
            }

            const signedUrl = await this._fileService.getReadSignedUrl(key);
            res.redirect(signedUrl);
        } catch (error) {
            next(error);
        }
    }
}