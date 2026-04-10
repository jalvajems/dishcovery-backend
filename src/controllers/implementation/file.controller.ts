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
            // Extract the key which might contain slashes. The route uses regex capture.
            // We must decode it because Express regex captures often provide the raw encoded string.
            const key = decodeURIComponent(req.params.key);
            if (!key) {
                res.status(400).send("Image key is required");
                return;
            }

            const signedUrl = await this._fileServie.getReadSignedUrl(key);
            
            // Redirect the client to the actual S3 pre-signed URL
            res.redirect(302, signedUrl);
        } catch (error) {
            console.error("Error serving image proxy:", error);
            res.status(404).send("Image not found");
        }
    }
}