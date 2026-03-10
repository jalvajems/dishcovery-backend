import { IWorkshopResponseDTO } from "../../dtos/workshop.dtos";
import { IWorkshopDocument } from "../../types/workshop.types";

export function workshopMapper(workshop: IWorkshopDocument): IWorkshopResponseDTO {
  const obj = workshop.toObject ? workshop.toObject() : workshop;

  const parseReference = <T>(ref: unknown): string | Partial<T> => {
    if (!ref) return '';
    if (typeof ref === 'object' && ref !== null && !(ref instanceof String)) {
      if ('_id' in ref) return ref as Partial<T>;
      const strRef = String(ref);
      if (strRef !== '[object Object]') return strRef;
    }
    return String(ref);
  };

  return {
    _id: obj._id,

    title: obj.title,
    banner: obj.banner,
    description: obj.description,
    category: obj.category,
    tags: obj.tags || [],

    chefId: parseReference<unknown>(obj.chefId) as unknown as IWorkshopResponseDTO['chefId'],

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