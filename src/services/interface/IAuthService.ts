import { SignupResponseDto,LoginResponseDto } from "../../dtos/aut.dtos";
import { IUserDocument } from "../../models/users.model";

export interface IAuthService{
    registerUser(userData:SignupResponseDto):Promise<IUserDocument>; 
    loginUser(loginData:LoginResponseDto):Promise<IUserDocument|null>; 
}