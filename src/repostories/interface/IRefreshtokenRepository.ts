export interface IRefreshtokenRepository{
    createRefreshToken(userId:string,refreshToken:string):Promise<void>;
    findByUserId(userId:string):Promise<string|null>;
    findByToken(refreshToken:string):Promise<string|null>;
    deleteByUserId(userId:string):Promise<void>;
    deleteByToken(refreshToken:string):Promise<void>;
}