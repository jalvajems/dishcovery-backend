export interface IRefreshtokenRepository{
    createRefreshToken(userId:string,refreshToken:string):Promise<void>;
    createForLookupToken(refreshToken:string):Promise<void>;
    findRefreshTokenById(userId:string):Promise<string|null>;
    findRefreshTokenByLookup(refreshToken:string):Promise<string|null>;
    delRefreshToken(userId:string):Promise<void>;
    delRefreshTokenLookup(refreshToken:string):Promise<void>;
}