import { Container } from "inversify";
import TYPES from "../types";
import { IAuthController } from "../../controllers/interface/IAuthController";
import { AuthController } from "../../controllers/implementation/auth.controller";
import { IAuthService } from "../../services/interface/IAuthService";
import { AuthService } from "../../services/implementation/auth.services";
import { IOtpRepository } from "../../repostories/interface/IOtpRepository";
import { OtpRepository } from "../../repostories/implementation/otp.repository";


export function authModule(container:Container){
    container.bind<IAuthController>(TYPES.IAuthController).to(AuthController),
    container.bind<IAuthService>(TYPES.IAuthService).to(AuthService),
    container.bind<IOtpRepository>(TYPES.IOtpRepository).to(OtpRepository)
}