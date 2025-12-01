import { IChefDocument } from "../../models/chef.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IChefRepository extends IBaseRepository<IChefDocument>{
    findByChefId(chefId:string):Promise<IChefDocument|null>;
    createProfile(data:object):Promise<IChefDocument>;
    updateProfile(chefId:string,data:Partial<IChefDocument>):Promise<IChefDocument|null>
}