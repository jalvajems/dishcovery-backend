import { IFoodieDto } from "../../dtos/foodie.dtos";
import { IFoodie } from "../../types/foodie.types";

export interface IFoodieService{
    editFoodieProfile(userId:string,foodieData:IFoodieDto):Promise<{message:string,foodieData:IFoodieDto|IFoodie|null}>;

}