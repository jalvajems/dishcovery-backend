import { SignupResponseDto,LoginResponseDto } from "../../dtos/aut.dtos";
import { OtpDto } from "../../dtos/otp.dtos";
import { IUserDto } from "../../dtos/user.dtos";
import { IUserDocument } from "../../models/users.model";

export interface IAuthService{
    signupUser(userData:SignupResponseDto):Promise<IUserDocument>; 
    loginUser(loginData:LoginResponseDto):Promise<{user:IUserDto,accessToken:string,refreshToken:string}>; 
    signupOtp(OtpVerifyData:OtpDto):Promise<{msg:string,user:OtpDto}>;
    forgetPass(email:string):Promise<void>;
    forgetPassOtp(OtpVerifyData:OtpDto):Promise<void>;
    resetPassword(email:string,newPass:string,confirmPass:string):Promise<void>;
    refreshToken(existingRefreshToken:string):Promise<{accessToken:string,refreshToken:string}>;
    logout(refreshToken:string):Promise<{message:string}>

}