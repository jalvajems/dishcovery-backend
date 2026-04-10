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
        @inject(TYPES.IFileService) private _fileServie: FileService,
    ) { }
    async signedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('asd', req.body);

            const { fileName, fileType } = req.body;
            const result = await this._fileServie.getSignedUrl(fileName, fileType);
            console.log('result', result);

            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result, message:S3_MESSAGES.S3URL_SEND  })
        } catch (error) {
            next(error)
        }
    }

    async serveImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const key = req.params[0];
            if (!key) {
                res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: "No key provided" });
                return;
            }

            const signedUrl = await this._fileServie.getReadSignedUrl(key);
            res.redirect(signedUrl);
        } catch (error) {
            next(error);
        }
    }
}