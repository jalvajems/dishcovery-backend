import { SignupResponseDto,LoginResponseDto } from "../../dtos/aut.dtos";
import { OtpDto } from "../../dtos/otp.dtos";
import { IUserDocument } from "../../models/users.model";

export interface IAuthService{
    signupUser(userData:SignupResponseDto):Promise<IUserDocument>; 
    loginUser(loginData:LoginResponseDto):Promise<IUserDocument|null>; 
    verifyOtp(OtpVerifyData:OtpDto):Promise<{msg:string,user:OtpDto}>
}