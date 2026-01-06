import { IWorkshopResponseDTO } from "../../dtos/workshopResponse.dtos";
import { IWorkshopDocument } from "../../models/workshop.model";

export function workshopMapper(workshop:IWorkshopDocument):IWorkshopResponseDTO{
    const obj=workshop.toObject()
    return{
        _id: obj._id.toString(),
          chefId: obj.chefId,
        
          title: obj.title,
          description: obj.description,
          category: obj.category,
        
          startDateTime: obj.startDateTime,
          durationInMinutes: obj.durationInMinutes,
        
          participantLimit: obj.participantLimit,
          totalBookings: obj.totalBookings,
        
          mode: obj.mode,
        
          location:obj.location,
        
          type: obj.type,
          price: obj.price,
          currency: obj.currency,
        
          status: obj.status,
        
          isSessionActive: obj.isSessionActive,
        
          createdAt: obj.createdAt,
          updatedAt: obj.updatedAt,

    }
}