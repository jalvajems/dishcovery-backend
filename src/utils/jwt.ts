import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.config';


export const generatTokens=(payloads:object)=>{
    const accessToken=jwt.sign(payloads,env.JWT_ACCESS_SECRET,{expiresIn:'15m'})
    const refreshToken=jwt.sign(payloads,env.JWT_REFRESH_SECRET,{expiresIn:'7d'})
    console.log("is there",refreshToken,"access")
    return {accessToken,refreshToken};
}
export interface TokenPayload extends JwtPayload {
  id: string;
  role?: string;
}