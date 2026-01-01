import mongoose,{Types} from "mongoose";
import { STATUS_CODE } from "../../constants/StatusCode";
import { FoodSpotModel, IFoodSpotDocument } from "../../models/foodSpot.model";
import { AppError } from "../../utils/AppError";
import { IFoodSpotRepository } from "../interface/IFoodSportRepository";
import { BaseRepository } from "./base.repository";
import { logger } from "../../utils/logger";
import { IFoodSpot } from "../../types/foodSpot.types";
import { FoodieModel } from "../../models/foodie.model";

export class FoodSpotRepository extends BaseRepository<IFoodSpotDocument> implements IFoodSpotRepository{
    constructor(){
        super(FoodSpotModel)
    }
  
async findFoodSpot(id: string): Promise<IFoodSpotDocument|null> {
  

    const result=await FoodSpotModel.findOne({_id:id}).populate("foodieId","name")
    return result;
}
async findNearByFoodSpot(lat: number, lng: number, maxDistance: number): Promise<IFoodSpotDocument[] | null> {
    return FoodSpotModel.find({
        location:{
            $near:{
                $geometry:{
                    type:"Point",
                    coordinates:[lng,lat],
                },
                $maxDistance:maxDistance,
            },
        },
        isApproved:true,
        isDeleted:false,
    })
    .populate("foodieId", "name email ")
}
async findAllFoodSpots(search: string, skip: number, limit: number): Promise<{ datas: IFoodSpotDocument[] | null; totalCount: number; }> {
     
                        const query:any={
                            isBlocked:false,
                            isApproved:true
                            
                        }
                        if(search){
                            query.$or=[
                                 { name: new RegExp(search, "i") },
                                 { tags: new RegExp(search, "i") }
                            ]
                        }
                         const spots=await FoodSpotModel.find(query).skip(skip).limit(limit).populate('foodieId','name')
            const totalCount=await FoodSpotModel.countDocuments(query)
            return {datas:spots,totalCount}
                        
                  
                    
}
async findAllFoodSpotsAdmin(filter: object, skip: number, limit: number): Promise<{ datas: IFoodSpotDocument[] | null; totalCount: number; }> {
     const spots=await FoodSpotModel.find(filter).skip(skip).limit(limit).populate('foodieId','name')
            const totalCount=await FoodSpotModel.countDocuments(filter)
            return {datas:spots,totalCount}
}
async findAllFoodSpotsByFoodie(foodieId: string, search: string, skip: number, limit: number): Promise<{ datas: IFoodSpotDocument[] | null; totalCount: number; }> {
const id = new Types.ObjectId(foodieId);

        const query:any={
              $and: [
      { foodieId: id }
    ]
        }
        if(search){
            query.$or=[
                 { name: new RegExp(search, "i") },
                 { tags: new RegExp(search, "i") }
            ]
        }
        const spots=await FoodSpotModel.find(query).sort({createdAt:-1}).skip(skip).limit(limit);

        const totalCount=await FoodSpotModel.countDocuments({foodieId:id})
        return {datas:spots,totalCount:totalCount}
}
async blockById(id: string): Promise<(IFoodSpot & Document) | null> {
    return await FoodSpotModel.findByIdAndUpdate({_id:id},{$set:{isBlocked:true}},{new:true})
}
async unblockById(id: string): Promise<(IFoodSpot & Document) | null> {
    return await FoodSpotModel.findByIdAndUpdate({_id:id},{$set:{isBlocked:false}},{new:true})
}
async approveById(id: string): Promise<(IFoodSpot & Document) | null> {
    return await FoodSpotModel.findByIdAndUpdate({_id:id},{$set:{isApproved:true}},{new:true})
}
async unAproveById(id: string): Promise<(IFoodSpot & Document) | null> {
    return await FoodSpotModel.findByIdAndUpdate({_id:id},{$set:{isApproved:false}},{new:true})
}

}