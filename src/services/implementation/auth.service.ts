import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IAuthService } from '../interface/IAuthService';
import { IUserDocument } from '../../models/users.model';
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
// import { userMapper } from '../../utils/mapper/user.mapper';
import { MESSAGES } from '../../constants/Message';
import { generatTokens, TokenPayload } from '../../utils/jwt';
import { userMapper } from '../../utils/mapper/user.mapper';
import { IUserDto } from '../../dtos/user.dtos';
import { redisClient } from '../../config/redis.config';
import { env } from '../../config/env.config';
import { IRefreshtokenRepository } from '../../repostories/interface/IRefreshtokenRepository';


@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
        @inject(TYPES.IOtpRepository) private otpRepository: IOtpRepository,
        @inject(TYPES.IRefreshRepository) private refreshTokenRepository: IRefreshtokenRepository
    ) { }


    async signupUser(userData: SignupResponseDto): Promise<IUserDocument> {
        try {
            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser) throw new AppError('Email already Registered', STATUS_CODE.BAD_REQUEST);

            const hashPassword = await bcrypt.hash(userData.password, 10)
            const otp = generateOTP(4)
            await this.otpRepository.createOtp(otp, userData.email)
            console.log("user email is: ", userData.email)

            const createdUser = await this.userRepository.create({
                ...userData,
                password: hashPassword,
            });

            sendMail(userData.email, 'Dishcovery: otp for signup', otp)

            return createdUser
        } catch (error) {
            throw new AppError('Error on singup', STATUS_CODE.INTERNAL_SERVER_ERROR)
        }
    }

    async loginUser(loginData: LoginResponseDto): Promise<{ user: IUserDto, accessToken: string, refreshToken: string }> {
        console.log("visting 1")
        const user = await this.userRepository.findByEmail(loginData.email)
        if (!user) throw new AppError('Invalid email or password', STATUS_CODE.UNAUTHORIZED);

        const isMatch = await bcrypt.compare(loginData.password, user.password);
        if (!isMatch) throw new AppError('Invalid credentials', STATUS_CODE.UNAUTHORIZED)

        const payloads = {
            id: user._id,
            role: user.role
        }
        const { accessToken, refreshToken } = generatTokens(payloads)
        console.log("REFRESH",refreshToken)
        await this.refreshTokenRepository.createRefreshToken(user.id, refreshToken);

        return { user: userMapper(user), accessToken, refreshToken };

    }

    async signupOtp(OtpVerifyData: OtpDto): Promise<{ msg: string, user: OtpDto }> {

        console.log('reached verify otp');
        const { otp, email } = OtpVerifyData;


        const redisOtp = await this.otpRepository.findOtp(email)
        console.log(redisOtp, 'redisotp');

        if (!redisOtp || redisOtp != otp) {
            log.error('otp is not match or not find');
            throw new AppError('invalide credentials', STATUS_CODE.UNAUTHORIZED);
        } else {
            await this.otpRepository.delOtp(email)
            log.info(`otp of user:${email} =${otp} is verified!!`)
            return { msg: 'Otp verified', user: OtpVerifyData }
        }
    }

    async forgetPass(email: string): Promise<void> {
        try {
            const existing = await this.userRepository.findByEmail(email)
            if (!existing) {
                throw new AppError('Email is not exist', STATUS_CODE.NOT_FOUND);
            }
            logger.info('email exist', existing);
            const otp = generateOTP(4);
            await this.otpRepository.createOtp(otp, email);
            console.log('email-------', existing);
            sendMail(email, 'Dishcovery: otp for reset password', otp);
            return

        } catch (error) {
            throw Error('no user found')
        }
    }

    async forgetPassOtp(OtpVerifyData: OtpDto): Promise<void> {
        try {
            console.log('reached on varify otp');

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

    async refreshToken(cookieToken: string): Promise<{ accessToken: string, refreshToken: string }> {
        if (!cookieToken) throw new AppError('token is not exist in cookies', 401);
        try {
            log.info('reached refresh service')
            const decoded = jwt.verify(cookieToken, env.JWT_REFRESH_SECRET) as TokenPayload
            const storedToken = await this.refreshTokenRepository.findRefreshTokenById(decoded.userId)
            log.info(`stored: ${storedToken}`)
            log.info(`existing: ${cookieToken}`)
            if (storedToken !== cookieToken) {
                log.info('checking both token')
                throw new AppError('Invalid token', 403);
            }
            log.info('creating new token')
            const { accessToken, refreshToken } = generatTokens({ id: decoded.userId, role: decoded.role });
            await this.refreshTokenRepository.delRefreshToken(decoded.userId);
            await this.refreshTokenRepository.createRefreshToken(decoded.userId, refreshToken);
            return { accessToken: accessToken, refreshToken: refreshToken };

        } catch (error) {
            log.error('refreshtoken failed');
            throw new Error('refresh token creation failed');
        }
    }
    async logout(refreshToken: string): Promise<{ message: string; }> {
        try {
            const lookup = await this.refreshTokenRepository.findRefreshTokenByLookup(refreshToken)
            if (lookup) {
                console.log(lookup)
            } else {
                new AppError('lookup is not found', STATUS_CODE.NOT_FOUND)
            }
            return { message: 'Logout failed' }
        } catch (error) {
            log.error('refreshtoken failed');
            throw new Error('refresh token creation failed');
        }
    }


}