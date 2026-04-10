import { generateReadSignedUrl, generateUploadSignedUrl } from "../../config/s3aws.config";
import { STATUS_CODE } from "../../constants/StatusCode";
import { SignedUrlResponseDto } from "../../dtos/signedUrl.dtos";
import { AppError } from "../../utils/AppError";
import { IFileService } from "../interface/IFileService";
import { injectable } from "inversify";

@injectable()
export class FileService implements IFileService {
    constructor() { }
    async getSignedUrl(fileName: string, fileType: string): Promise<SignedUrlResponseDto> {
        if (!fileName || !fileType) throw new AppError('no filetype or filename found', STATUS_CODE.NOT_FOUND);
        const result = await generateUploadSignedUrl(fileName, fileType);
        return result
    }

    async getReadSignedUrl(key: string): Promise<string> {
        if (!key) throw new AppError('Key is required', STATUS_CODE.BAD_REQUEST);
        return await generateReadSignedUrl(key);
    }
}