import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IAuthService } from '../interface/IAuthService';
import { AppError } from '../../utils/AppError';
import { inject, injectable } from 'inversify';
import { IUserRepository } from '../../repostories/interface/IUserRepository';
import TYPES from '../../DI/types';
import { STATUS_CODE } from '../../constants/StatusCode';
import { SignupResponseDto, LoginResponseDto } from '../../dtos/aut.dtos';
import { generateOTP } from '../../utils/cryptoOtp';
import { sendMail } from '../../utils/mailer';
import { log, logger } from '../../utils/logger';
import { OtpDto } from '../../dtos/otp.dtos';
import { MESSAGES } from '../../constants/Message';
import { generatTokens, TokenPayload } from '../../utils/jwt';
import { userMapper } from '../../utils/mapper/user.mapper';
import { IUserDto } from '../../dtos/user.dtos';
import { env } from '../../config/env.config';
import { IRefreshtokenRepository } from '../../repostories/interface/IRefreshtokenRepository';
import { redisClient } from '../../config/redis.config';


@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject(TYPES.IUserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.IRefreshRepository) private _refreshTokenRepository: IRefreshtokenRepository
    ) { }


    async signupUser(userData: SignupResponseDto): Promise<{ userData: IUserDto, otp: string | null }> {
        try {
            const existingUser = await this._userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new AppError(MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED, STATUS_CODE.CONFLICT);
            }

            const hashPassword = await bcrypt.hash(userData.password, 10)
            const otp = generateOTP(4)

            const key = `otp:${userData.email}`
            await redisClient.setEx(key, Number(process.env.OTP_EXP), otp)

            const redisOtp = await redisClient.get(key)


            const createdUser = await this._userRepository.create({
                ...userData,
                password: hashPassword,
            });

            await sendMail(userData.email, 'Dishcovery: otp for signup', otp);

            return { userData: userMapper(createdUser), otp: redisOtp }
        } catch (error: unknown) {
            if (error instanceof AppError) {
                throw error;
            }
            const errorMessage = error instanceof Error ? error.message : 'Error in signup';
            throw new AppError(errorMessage, STATUS_CODE.INTERNAL_SERVER_ERROR)
        }
    }

    async loginUser(loginData: LoginResponseDto): Promise<{ user: IUserDto, accessToken: string, refreshToken: string }> {

        const user = await this._userRepository.findByEmail(loginData.email)
        if (!user) throw new AppError(MESSAGES.AUTH.INVALID_MAIL_PASS, STATUS_CODE.UNAUTHORIZED);

        const isMatch = await bcrypt.compare(loginData.password, user.password);
        if (!isMatch) throw new AppError(MESSAGES.AUTH.INVALID_CREDENTIALS, STATUS_CODE.UNAUTHORIZED)

        const payload = {
            id: user._id as string,
            role: user.role
        }
        const { accessToken, refreshToken } = generatTokens(payload)
        // await this._refreshTokenRepository.createRefreshToken(user.id, refreshToken);
        await redisClient.set(`refreshKey:${user.id}`, refreshToken, { EX: Number(process.env.REDIS_REFRESH_EXP) })
        await redisClient.set(`refreshLookup:${refreshToken}`, user.id, { EX: Number(process.env.REDIS_REFRESH_EXP) })

        return { user: userMapper(user), accessToken, refreshToken };

    }

    async signupOtp(OtpVerifyData: OtpDto): Promise<{ msg: string, user: OtpDto }> {

        const { otp, email } = OtpVerifyData;


        const key = `otp:${email}`
        const redisOtp = await redisClient.get(key);

        if (!redisOtp || redisOtp != otp) {
            throw new AppError(MESSAGES.AUTH.INVALID_OTP, STATUS_CODE.UNAUTHORIZED);
        } else {
            await redisClient.del(key);
            return { msg: MESSAGES.AUTH.OTP_VERIFIED, user: OtpVerifyData }
        }
    }

    async forgetPass(email: string): Promise<void> {
        try {
            console.log("hi2")
            const existing = await this._userRepository.findByEmail(email)
            if (!existing) {
                throw new AppError(MESSAGES.AUTH.EMAIL_NOTFOUND, STATUS_CODE.NOT_FOUND);
            }
            const otp = generateOTP(4);

            const key = `otp:${email}`
            await redisClient.set(key, otp, { EX: Number(process.env.OTP_EXP) })


            sendMail(email, 'Dishcovery: otp for reset password', otp);
            return

        } catch {
            throw Error(MESSAGES.USER.NOT_FOUND)
        }
    }

    async forgetPassOtp(OtpVerifyData: OtpDto): Promise<void> {
        try {

            console.log("hi")
            const { otp, email } = OtpVerifyData;
            const key = `otp:${email}`
            const redisOtp = await redisClient.get(key)
            console.log('redis otp------', redisOtp);
            console.log('otp------', otp);

            if (!redisOtp || redisOtp !== otp) {
                console.log('incorect');

                throw new AppError(MESSAGES.AUTH.OTP_UNMATCH, STATUS_CODE.NOT_FOUND)
            }
            await redisClient.del(key);

        } catch (error) {
            log.error(MESSAGES.ERROR.INTERNAL_SERVER_ERROR, error)
            throw new Error(MESSAGES.AUTH.OTP_VERIFY_FAILED);
        }
    }
    async resendOtp(email: string): Promise<object> {
        console.log("hi1")
        const otp = generateOTP(4)

        const key = `otp:${email}`
        await redisClient.set(key, otp, { EX: Number(process.env.OTP_EXP) })
        await sendMail(email, 'Your Resend OTP is:', otp);
        return { message:MESSAGES.AUTH.OTP_RESENT  }
    }
    async resetPassword(email: string, newPass: string, confirmPass: string): Promise<void> {
        try {
            if (newPass !== confirmPass) {
                throw new AppError(MESSAGES.AUTH.CONFIRM_PASS_UNMATCH, STATUS_CODE.INTERNAL_SERVER_ERROR)
            }
            const hashedPass = await bcrypt.hash(newPass, 10)
            await this._userRepository.updatePasswordByEmail(email, hashedPass)
            logger.info('password reseted successfuly!!');

        } catch (error) {
            log.error(MESSAGES.ERROR.INTERNAL_SERVER_ERROR, error);
            throw new Error('error in reset password');

        }
    }

    async refreshToken(cookieToken: string): Promise<{ accessToken: string, refreshToken: string, role: string, user: IUserDto }> {
        if (!cookieToken) throw new AppError('token is not exist in cookies', 401);
        try {
            const decoded = jwt.verify(cookieToken, env.JWT_REFRESH_SECRET) as TokenPayload
            // const storedToken = await this._refreshTokenRepository.findByUserId(decoded.id)
            const key = `refreshKey:${decoded.id}`;
            const storedToken = await redisClient.get(key);

            if (!storedToken || storedToken !== cookieToken) {
                throw new AppError(MESSAGES.AUTH.INVALIDE_TOKEN, STATUS_CODE.FORBIDDEN);
            }
            if (!decoded.role) {
                throw new AppError(MESSAGES.AUTH.INVALIDE_ROLE, STATUS_CODE.INTERNAL_SERVER_ERROR)
            }

            const user = await this._userRepository.findById(decoded.id);
            if (!user) {
                throw new AppError(MESSAGES.USER.NOT_FOUND, STATUS_CODE.NOT_FOUND);
            }

            const { accessToken, refreshToken } = generatTokens({ id: decoded.id, role: decoded.role });

            await this._refreshTokenRepository.deleteByUserId(decoded.id);
            await this._refreshTokenRepository.createRefreshToken(decoded.id, refreshToken);

            const oldRefreshLookupKey = `refreshLookup:${cookieToken}`;
            await redisClient.del(oldRefreshLookupKey);
            await redisClient.del(`refreshKey:${decoded.id}`);

            await redisClient.set(`refreshKey:${decoded.id}`, refreshToken, { EX: Number(process.env.REDIS_REFRESH_EXP) })
            await redisClient.set(`refreshLookup:${refreshToken}`, decoded.id, { EX: Number(process.env.REDIS_REFRESH_EXP) })


            return { accessToken: accessToken, refreshToken: refreshToken, role: decoded.role, user: userMapper(user) };

        } catch {
            throw new Error(MESSAGES.AUTH.REFRESH_TOKEN_CREATION_FAILED);
        }
    }
    async logout(refreshToken: string): Promise<{ message: string; }> {
        try {
            const userId = await this._refreshTokenRepository.findByToken(refreshToken)
            if (userId == null) {
                throw new AppError(MESSAGES.USER.NOT_FOUND, STATUS_CODE.NOT_FOUND)
            } else {

                await this._refreshTokenRepository.deleteByUserId(userId)
            }
            return { message: 'Logout success' }
        } catch {
            throw new Error(MESSAGES.AUTH.REFRESH_TOKEN_CREATION_FAILED);
        }
    }


}