import bcrypt from 'bcryptjs';
import { IAuthService } from '../interface/IAuthService';
import { IUserDocument } from '../../models/users.model';
import { AppError } from '../../utils/AppError';
import { inject, injectable } from 'inversify';
import { IUserRepository } from '../../repostories/interface/IUserRepository';
import TYPES from '../../DI/types';
import { STATUS_CODE } from '../../constants/StatusCode';
import { SignupResponseDto,LoginResponseDto} from '../../dtos/aut.dtos';


@injectable()
export class AuthService implements IAuthService {
    constructor(@inject(TYPES.IUserRepository) private userRepository: IUserRepository) { }


    async registerUser(userData: SignupResponseDto): Promise<IUserDocument> {

        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) throw new AppError('Email already Registered', STATUS_CODE.BAD_REQUEST);

        const hashPassword = await bcrypt.hash(userData.password, 10)

        return await this.userRepository.create({
            ...userData,
            password: hashPassword,
        });
    }

    async loginUser(loginData:LoginResponseDto): Promise<IUserDocument | null> {

        const user = await this.userRepository.findByEmail(loginData.email)
        if (!user) throw new AppError('Invalid email or password', STATUS_CODE.UNAUTHORIZED);

        const isMatch = await bcrypt.compare(loginData.password, user.password);
        if (!isMatch) throw new AppError('Invalid credentials', STATUS_CODE.UNAUTHORIZED)

        return user;

    }

    
}