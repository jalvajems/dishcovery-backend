import { inject, injectable } from "inversify";
import { IAdminService } from "../interface/IAdminService";
import TYPES from "../../DI/types";
import { IUserRepository } from "../../repostories/interface/IUserRepository";
import { userMapper } from "../../utils/mapper/user.mapper";
import { usersMapper } from "../../utils/mapper/allUser.mapper";
import { IUserDto } from "../../dtos/user.dtos";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { IPaginationDto } from "../../dtos/IPaginationDto";

@injectable()
export class AdminService implements IAdminService {
    constructor(
        @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    ) { }

    async getAllFoodies(query: IPaginationDto): Promise<{ data: IUserDto[]; currentPage: number; totalPages: number }> {
        const { page, limit, search, isBlocked } = query;
        const filter: any = { role: "user" };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ]
        }
        if (isBlocked === "true") filter.isBlocked = true;
        if (isBlocked === "false") filter.isBlocked = false;


        const skip = (page - 1) * limit;

        const users = await this.userRepository.findByRole(filter, skip, limit)
        const totalCount = await this.userRepository.countDocuments(filter)

        let total = Math.ceil(totalCount / limit)

        return {
            data: usersMapper(users),
            currentPage: page,
            totalPages: total,
        }

    }
    async getAllChefs(query: IPaginationDto): Promise<{ data: IUserDto[]; currentPage: number; totalPages: number; }> {
        const { page, limit, search, isBlocked, isVerified } = query;
        const skip = (page - 1) * limit;
        const filter: any = { role: "chef" };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ]
        }
        if (isBlocked === "true") filter.isBlocked = true;
        if (isBlocked === "false") filter.isBlocked = false;

        if (isVerified === "true") filter.isVerified = true;
        if (isVerified === "false") filter.isVerified = false;


        const users = await this.userRepository.findByRole(filter, skip, limit)
        const totalCount = await this.userRepository.countDocuments(filter)
        return {
            data: usersMapper(users),
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
        }
    }
    async blockUserById(id: string): Promise<IUserDto> {
        const result = await this.userRepository.blockById(id);
        if (!result) throw new AppError('result is empty', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return userMapper(result);

    }
    async unBlockUserById(id: string): Promise<IUserDto> {
        const result = await this.userRepository.unblockById(id);
        if (!result) throw new AppError('result is empty', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return userMapper(result);

    }
    async verifyChef(id: string): Promise<IUserDto> {
        const result = await this.userRepository.verifyById(id);
        if (!result) throw new AppError('user in empty', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return userMapper(result)
    }
    async unVerifyChef(id: string): Promise<IUserDto> {
        const result = await this.userRepository.unVerifyById(id);
        if (!result) throw new AppError('user is empty', STATUS_CODE.INTERNAL_SERVER_ERROR);
        return userMapper(result);
    }

}