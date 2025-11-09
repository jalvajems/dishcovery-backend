export interface IOtpRepository  {
    createOtp(otp:string,email:string):Promise<void>;
    findOtp(email:string):Promise<string|null>;
    delOtp(email:string):Promise<void>;
}