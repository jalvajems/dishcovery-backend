import { IFoodSpotDocument } from "../../models/foodSpot.model";
import { IFoodSpot } from "../../types/foodSpot.types";
import { IBaseRepository } from "./IBaseRepository";

export interface IFoodSpotRepository extends IBaseRepository<IFoodSpotDocument>{
    findFoodSpot(id:string):Promise<IFoodSpotDocument|null>;
    findNearByFoodSpot(lat:number,lng:number,maxDistance:number):Promise<IFoodSpotDocument[]|null>
    findAllFoodSpotsByFoodie(foodieId:string,search:string,skip:number, limit:number):Promise<{datas:IFoodSpotDocument[] | null,totalCount:number}> 
    findAllFoodSpots(search: string, skip: number, limit: number, ): Promise<{datas:IFoodSpotDocument[] | null,totalCount:number}> 
    findAllFoodSpotsAdmin(filter: object, skip: number, limit: number, ): Promise<{datas:IFoodSpotDocument[] | null,totalCount:number}> 
    blockById(id:string):Promise<IFoodSpot & Document|null>;
    unblockById(id:string):Promise<IFoodSpot & Document|null>;    
    approveById(id:string):Promise<IFoodSpot & Document|null>;
    unAproveById(id:string):Promise<IFoodSpot & Document|null>;
        
    

}