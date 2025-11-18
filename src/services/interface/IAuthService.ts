import { SignupResponseDto,LoginResponseDto } from "../../dtos/aut.dtos";
import { OtpDto } from "../../dtos/otp.dtos";
import { IUserDto } from "../../dtos/user.dtos";

export interface IAuthService{
    signupUser(userData:SignupResponseDto):Promise<{userData:IUserDto,otp:string|null}>; 
    loginUser(loginData:LoginResponseDto):Promise<{user:IUserDto,accessToken:string,refreshToken:string}>; 
    signupOtp(OtpVerifyData:OtpDto):Promise<{msg:string,user:OtpDto}>;
    forgetPass(email:string):Promise<void>;
    forgetPassOtp(OtpVerifyData:OtpDto):Promise<void>;
    resendOtp(email:string):Promise<object>;
    resetPassword(email:string,newPass:string,confirmPass:string):Promise<void>;
    refreshToken(existingRefreshToken:string):Promise<{accessToken:string,refreshToken:string,role:string}>;
    logout(refreshToken:string):Promise<{message:string}>

}