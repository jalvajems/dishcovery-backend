import bcrypt from 'bcryptjs';
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
import { log } from '../../utils/logger';
import { OtpDto } from '../../dtos/otp.dtos';
import { IOtpRepository } from '../../repostories/interface/IOtpRepository';
import { userMapper } from '../../utils/mapper/user.mapper';
import { MESSAGES } from '../../constants/Message';


@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
        @inject(TYPES.IOtpRepository) private otpRepository: IOtpRepository
    ) { }


    async signupUser(userData: SignupResponseDto): Promise<IUserDocument> {

        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) throw new AppError('Email already Registered', STATUS_CODE.BAD_REQUEST);

        const hashPassword = await bcrypt.hash(userData.password, 10)
        const otp = await generateOTP(4)
        await this.otpRepository.createOtp(otp, userData.email)

        sendMail(userData.email, 'Dishcovery: otp for signup', otp)


        return await this.userRepository.create({
            ...userData,
            password: hashPassword,
        });
    }

    async loginUser(loginData: LoginResponseDto): Promise<IUserDocument | null> {
        
        const user = await this.userRepository.findByEmail(loginData.email)
        if (!user) throw new AppError('Invalid email or password', STATUS_CODE.UNAUTHORIZED);
        
        const isMatch = await bcrypt.compare(loginData.password, user.password);
        if (!isMatch) throw new AppError('Invalid credentials', STATUS_CODE.UNAUTHORIZED)
            
            return user;
            
        }
        
    async verifyOtp(OtpVerifyData: OtpDto): Promise<{msg:string, user:OtpDto}> {
            
        console.log('reached verify otp');
        const {otp,email} = OtpVerifyData;
        
        
        const redisOtp = await this.otpRepository.findOtp(email)
        console.log(redisOtp,'redisotp');
        
        if (!redisOtp || redisOtp != otp) {
            log.error('otp is not match or not find');
            throw new AppError('invalide credentials', STATUS_CODE.UNAUTHORIZED);
        }else{
            await this.otpRepository.delOtp(email)
            log.info(`otp of user:${email} =${otp} is verified!!`)
            return {msg:'Otp verified',user:OtpVerifyData}
        }
    }


}