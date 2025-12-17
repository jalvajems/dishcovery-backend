import { Request, Response, NextFunction } from "express";
import { IFileController } from "../interface/IFileController";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { FileService } from "../../services/implementation/file.service";
import { STATUS_CODE } from "../../constants/StatusCode";
import { success } from "zod";

@injectable()
export class FileController implements IFileController{
    constructor(
        @inject(TYPES.IFileService) private _fileServie:FileService,
    ){}
    async signedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            console.log('asd',req.body);
            
            const {fileName,fileType}=req.body;
            const result=await this._fileServie.getSignedUrl(fileName,fileType);
            console.log('result',result);
            
            res.status(STATUS_CODE.SUCCESS).json({success:true,data:result,message:"s3 urls sended"})
        } catch (error) {
            next(error)
        }
    }
}