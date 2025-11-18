import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.config';


export const generatTokens = (payload: TokenPayload) => {
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
  return { accessToken, refreshToken };
}
export interface TokenPayload extends JwtPayload {
  id: string;
  role?: string;
}