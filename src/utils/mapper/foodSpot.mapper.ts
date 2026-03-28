import { IFoodSpotResDto } from "../../dtos/foodSpot.dtos";
import { IFoodSpotDocument } from "../../models/foodSpot.model";

export function foodSpotResponseMapper(foodSpot: IFoodSpotDocument): IFoodSpotResDto {
  const obj = typeof foodSpot.toObject === 'function' ? foodSpot.toObject() : foodSpot;

  return {
    _id: obj._id.toString(),
    name: obj.name,
    description: obj.description,
    coverImage: obj.coverImage,

    location: obj.location,
    address: obj.address,
    exploredFoods: obj.exploredFoods,

    speciality: obj.speciality,
    tags: obj.tags,
    openingHours:obj.openingHours,

    rating: obj.rating,
    likesCount: obj.likesCount,
    savesCount: obj.savesCount,

    foodieId: {
      id: obj.foodieId?._id.toString(),
      name: obj.foodieId?.name,
      email: obj.foodieId?.email,
      role: obj.foodieId?.role,
    },
     isApproved: obj.isApproved,
    isBlocked: obj.isBlocked,

    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };
}
