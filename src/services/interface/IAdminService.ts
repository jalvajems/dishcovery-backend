import { IPaginationDto } from "../../dtos/IPaginationDto";
import { IUserDto } from "../../dtos/user.dtos";

export interface IAdminService{
    getAllFoodies(query:IPaginationDto):Promise<{data:IUserDto[],currentPage:number,totalPages:number}>;
    getAllChefs(query:IPaginationDto):Promise<{ data: IUserDto[]; currentPage: number; totalPages: number; }>;
    blockUserById(id:string):Promise<IUserDto>; 
    unBlockUserById(id:string):Promise<IUserDto>; 
    verifyChef(id:string):Promise<IUserDto>;
    unVerifyChef(id:string):Promise<IUserDto>;
}