import { IFoodieDocument } from "../../models/foodie.model";
import { IFoodie } from "../../types/foodie.types";
import { IBaseRepository } from "./IBaseRepository";

export interface IFoodieRepository extends IBaseRepository<IFoodieDocument>{
    getByUserId(userId:string):Promise<IFoodieDocument|null>;
    findOneUpdateFoodie(userId:string,updateData:object):Promise<IFoodieDocument|null>;

}