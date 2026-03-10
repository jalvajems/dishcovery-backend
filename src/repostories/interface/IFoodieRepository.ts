import { IFoodieDocument } from "../../models/foodie.model";
import { IBaseRepository } from "./IBaseRepository";

export interface IFoodieRepository extends IBaseRepository<IFoodieDocument> {
    getByUserId(userId: string): Promise<IFoodieDocument | null>;
    findOneUpdateFoodie(userId: string, updateData: Partial<IFoodieDocument>): Promise<IFoodieDocument | null>;

}