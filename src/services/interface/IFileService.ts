import { SignedUrlResponseDto } from "../../dtos/signedUrl.dtos";

export interface IFileService{
    getSignedUrl(fileName:string,fileType:string):Promise<SignedUrlResponseDto>
    getReadSignedUrl(key: string): Promise<string>;
}