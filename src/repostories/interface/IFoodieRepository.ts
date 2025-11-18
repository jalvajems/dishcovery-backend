import { IFoodieDocument } from "../../models/foodie.model";
import { IFoodie } from "../../types/foodie.types";
import { IBaseRepository } from "./IBaseRepository";

export interface IFoodieRepository extends IBaseRepository<IFoodieDocument>{
    findByUserId(userId:string):Promise<IFoodieDocument|null>;
    findByEmail(email:string):Promise<IFoodieDocument|null>;
    findOneUpdateFoodie(userId:string,updateData:IFoodie):Promise<IFoodie|null>;
}