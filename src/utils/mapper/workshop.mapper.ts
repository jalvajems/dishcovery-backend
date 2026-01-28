import { IWorkshopResponseDTO } from "../../dtos/workshop.dtos";
import { IWorkshopDocument } from "../../types/workshop.types";

export function workshopMapper(workshop:IWorkshopDocument):IWorkshopResponseDTO{
    const obj=workshop.toObject()
     return {
      id: obj.id,

      title: obj.title,
      description: obj.description,
      category: obj.category,
      tags: obj.tags || [],

      chefId: obj.chefId.toString(),

      date: obj.date,
      startTime: obj.startTime,
      duration: obj.duration,
      participantLimit: obj.participantLimit,
      participantsCount: obj.participantsCount,

      mode: obj.mode,
      isFree: obj.isFree,
      price: obj.price,

      location: obj.location
        ? {
            venueName: obj.location.venueName,
            address: obj.location.address,
            city: obj.location.city,
          }
        : undefined,

      isLive: obj.isLive,
      status: obj.status,

      createdAt: obj.createdAt,
      updatedAt: obj.updatedAt
    };
  
}