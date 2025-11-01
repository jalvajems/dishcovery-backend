import { Container } from "inversify";
import TYPES from "../types";
import { IUserRepository } from "../../repostories/interface/IUserRepository";
import { UserRepository } from "../../repostories/implementation/user.repository";

export default function userModule(container:Container){
    container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository)
}