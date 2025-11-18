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
import { IOtpRepository } from '../../repostories/interface/IOtpRepository';
import { MESSAGES } from '../../constants/Message';
import { generatTokens, TokenPayload } from '../../utils/jwt';
import { userMapper } from '../../utils/mapper/user.mapper';
import { IUserDto } from '../../dtos/user.dtos';
import { env } from '../../config/env.config';
import { IRefreshtokenRepository } from '../../repostories/interface/IRefreshtokenRepository';
import { email } from 'zod';


@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
        @inject(TYPES.IOtpRepository) private otpRepository: IOtpRepository,
        @inject(TYPES.IRefreshRepository) private refreshTokenRepository: IRefreshtokenRepository
    ) { }


    async signupUser(userData: SignupResponseDto): Promise<{ userData: IUserDto, otp: string | null }> {
        try {
            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new AppError('Email already Registered', STATUS_CODE.CONFLICT);
            }

            const hashPassword = await bcrypt.hash(userData.password, 10)
            const otp = generateOTP(4)

            await this.otpRepository.createOtp(otp, userData.email)
            const redisOtp = await this.otpRepository.findOtp(String(email))

            const createdUser = await this.userRepository.create({
                ...userData,
                password: hashPassword,
            });

            await sendMail(userData.email, 'Dishcovery: otp for signup', otp);

            return { userData: userMapper(createdUser), otp: redisOtp }
        } catch (error: any) {
            if (error instanceof AppError) {
                throw error;
            }

            throw new AppError(error.message || 'Error in signup', STATUS_CODE.INTERNAL_SERVER_ERROR)
        }
    }

    async loginUser(loginData: LoginResponseDto): Promise<{ user: IUserDto, accessToken: string, refreshToken: string }> {

        const user = await this.userRepository.findByEmail(loginData.email)
        if (!user) throw new AppError('Invalid email or password', STATUS_CODE.UNAUTHORIZED);

        const isMatch = await bcrypt.compare(loginData.password, user.password);
        if (!isMatch) throw new AppError('Invalid credentials', STATUS_CODE.UNAUTHORIZED)

        const payload = {
            id: user._id as string,
            role: user.role
        }
        const { accessToken, refreshToken } = generatTokens(payload)
        await this.refreshTokenRepository.createRefreshToken(user.id, refreshToken);

        return { user: userMapper(user), accessToken, refreshToken };

    }

    async signupOtp(OtpVerifyData: OtpDto): Promise<{ msg: string, user: OtpDto }> {

        const { otp, email } = OtpVerifyData;


        const redisOtp = await this.otpRepository.findOtp(email)

        if (!redisOtp || redisOtp != otp) {
            throw new AppError('invalide Otp!!', STATUS_CODE.UNAUTHORIZED);
        } else {
            await this.otpRepository.delOtp(email)
            return { msg: 'Otp verified', user: OtpVerifyData }
        }
    }

    async forgetPass(email: string): Promise<void> {
        try {
            const existing = await this.userRepository.findByEmail(email)
            if (!existing) {
                throw new AppError('Email is not exist', STATUS_CODE.NOT_FOUND);
            }
            const otp = generateOTP(4);
            await this.otpRepository.createOtp(otp, email);
            sendMail(email, 'Dishcovery: otp for reset password', otp);
            return

        } catch (error) {
            throw Error('no user found')
        }
    }

    async forgetPassOtp(OtpVerifyData: OtpDto): Promise<void> {
        try {

            const { otp, email } = OtpVerifyData;
            let redisOtp = await this.otpRepository.findOtp(email);
            if (!redisOtp && redisOtp !== otp) {
                throw new AppError('Otp is not found or not match', STATUS_CODE.NOT_FOUND)
            }
            await this.otpRepository.delOtp(email);

        } catch (error) {
            log.error(MESSAGES.ERROR.INTERNAL_SERVER_ERROR, error)
            throw new Error('otp varificaton failed');
        }
    }
    async resendOtp(email: string): Promise<object> {
        const otp = generateOTP(4)
        await this.otpRepository.createOtp(otp, email);
        await sendMail(email, 'Your Resend OTP is:', otp);
        return { message: 'OTP resent successfully!' }
    }
    async resetPassword(email: string, newPass: string, confirmPass: string): Promise<void> {
        try {
            if (newPass !== confirmPass) {
                throw new AppError('confirm password is not matching', STATUS_CODE.INTERNAL_SERVER_ERROR)
            }
            const hashedPass = await bcrypt.hash(newPass, 10)
            await this.userRepository.updatePasswordByEmail(email, hashedPass)
            logger.info('password reseted successfuly!!');

        } catch (error) {
            log.error(MESSAGES.ERROR.INTERNAL_SERVER_ERROR, error);
            throw new Error('error in reset password');

        }
    }

    async refreshToken(cookieToken: string): Promise<{ accessToken: string, refreshToken: string, role: string }> {
        if (!cookieToken) throw new AppError('token is not exist in cookies', 401);
        try {
            const decoded = jwt.verify(cookieToken, env.JWT_REFRESH_SECRET) as TokenPayload
            const storedToken = await this.refreshTokenRepository.findByUserId(decoded.id)
            if (!storedToken || storedToken !== cookieToken) {
                throw new AppError('Invalid token', STATUS_CODE.FORBIDDEN);
            }
            if (!decoded.role) {
                throw new AppError('Invalid role', STATUS_CODE.INTERNAL_SERVER_ERROR)
            }
            const { accessToken, refreshToken } = generatTokens({ id: decoded.id, role: decoded.role });

            await this.refreshTokenRepository.deleteByUserId(decoded.id);
            await this.refreshTokenRepository.createRefreshToken(decoded.id, refreshToken);

            return { accessToken: accessToken, refreshToken: refreshToken, role: decoded.role };

        } catch (error) {
            throw new Error('refresh token creation failed');
        }
    }
    async logout(refreshToken: string): Promise<{ message: string; }> {
        try {
            const userId = await this.refreshTokenRepository.findByToken(refreshToken)
            if (userId == null) {
                new AppError('lookup is not found', STATUS_CODE.NOT_FOUND)
            } else {

                await this.refreshTokenRepository.deleteByUserId(userId)
            }
            return { message: 'Logout success' }
        } catch (error) {
            throw new Error('refresh token creation failed');
        }
    }


}