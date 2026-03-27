import { IFoodSpotResDto } from "../../dtos/foodSpot.dtos";

export interface IFoodSpotService {
    createFoodSpot(data: object): Promise<{ data: IFoodSpotResDto }>
    getFoodSpot(id: string): Promise<{ data: IFoodSpotResDto }>
    updateFoodSpot(id: string, data: object): Promise<void>
    getNearByFoodSpot(lat: number, lng: number, distance: number): Promise<{ data: IFoodSpotResDto[] }>
    getAllFoodSpots(page: number, limit: number, search: string, filter?: string, sortBy?: string, userId?: string): Promise<{ data: IFoodSpotResDto[], totalCount: number }>
    getAllFoodSpotsByFoodie(id: string, page: number, limit: number, search: string): Promise<{ data: IFoodSpotResDto[], totalCount: number }>
    getRecentFoodSpots(limit: number): Promise<{ data: IFoodSpotResDto[] }>;
    toggleSaveFoodSpot(id: string, foodSpotId: string): Promise<{ message: string, isSaved: boolean }>;
    getSavedFoodSpots(id: string, page: number, limit: number): Promise<{ data: IFoodSpotResDto[], currentPage: number, totalPages: number, message: string }>;
}
