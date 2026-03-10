import { inject, injectable } from "inversify";
import { IFoodSpotService } from "../interface/IFoodSpotService";
import TYPES from "../../DI/types";
import { IFoodSpotRepository } from "../../repostories/interface/IFoodSportRepository";
import { IFoodSpotResDto } from "../../dtos/foodSpot.dtos";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { foodSpotResponseMapper } from "../../utils/mapper/foodSpot.mapper";
import { allFoodSpotsMapper } from "../../utils/mapper/allFoodSpot. mapper";

import { ISaveRepository } from "../../repostories/interface/ISaveRepository";

@injectable()
export class FoodSpotService implements IFoodSpotService {
    constructor(
        @inject(TYPES.IFoodSpotRepository) private _foodSpotRepository: IFoodSpotRepository,
        @inject(TYPES.ISaveRepository) private _saveRepository: ISaveRepository
    ) { }
    async createFoodSpot(data: object): Promise<{ data: IFoodSpotResDto; }> {

        const result = await this._foodSpotRepository.create(data);
        if (!result) throw new AppError('failed to create foodspot', STATUS_CODE.INTERNAL_SERVER_ERROR)
        return { data: foodSpotResponseMapper(result) }
    }
    async updateFoodSpot(id: string, data: object): Promise<void> {
        console.log('========', data);

        const result = await this._foodSpotRepository.updateById(id, data);
        if (!result) throw new AppError('failed to updated', STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
    async getFoodSpot(id: string): Promise<{ data: IFoodSpotResDto; }> {
        const result = await this._foodSpotRepository.findFoodSpot(id);
        if (!result) throw new AppError('failed to get food spot', STATUS_CODE.INTERNAL_SERVER_ERROR);
        console.log('food=========1', result);

        return { data: foodSpotResponseMapper(result) }
    }
    async getNearByFoodSpot(lat: number, lng: number, distance: number): Promise<{ data: IFoodSpotResDto[]; }> {
        const spots = await this._foodSpotRepository.findNearByFoodSpot(lat, lng, distance)
        if (!spots) throw new AppError('spot is not found', STATUS_CODE.NOT_FOUND)

        return { data: allFoodSpotsMapper(spots) }
    }
    async getAllFoodSpots(page: number, limit: number, search: string, filter?: string): Promise<{ data: IFoodSpotResDto[], totalCount: number }> {
        const skip = (page - 1) * limit;
        const spots = await this._foodSpotRepository.findAllFoodSpots(search, skip, limit, filter)
        console.log('00000000000', spots);

        if (!spots.datas) throw new AppError('spots are not found', STATUS_CODE.NOT_FOUND)
        return { data: allFoodSpotsMapper(spots.datas), totalCount: spots.totalCount }
    }
    async getAllFoodSpotsByFoodie(id: string, page: number, limit: number, search: string): Promise<{ data: IFoodSpotResDto[], totalCount: number }> {
        const skip = (page - 1) * limit;
        console.log('spotsserv', page);
        console.log('spotsservi', id);
        console.log('spotsservic', limit);
        console.log('spotsservic', search);
        const spots = await this._foodSpotRepository.findAllFoodSpotsByFoodie(id, search, skip, limit)
        console.log('spotsservice', spots);

        if (!spots.datas) throw new AppError('spots are not found', STATUS_CODE.NOT_FOUND)
        return { data: allFoodSpotsMapper(spots.datas), totalCount: spots.totalCount }
    }
    async getRecentFoodSpots(limit: number): Promise<{ data: IFoodSpotResDto[]; }> {
        const result = await this._foodSpotRepository.findRecent(limit);
        if (!result) throw new AppError('No recent spots found', STATUS_CODE.NOT_FOUND);
        return { data: allFoodSpotsMapper(result) };
    }

    async toggleSaveFoodSpot(id: string, foodSpotId: string): Promise<{ message: string, isSaved: boolean }> {
        const user = await this._saveRepository.findById(id);
        const isSaved = user?.savedFoodSpots.includes(foodSpotId);
        if (!isSaved) {
            await this._saveRepository.saveFoodSpot(id, foodSpotId);
            return { message: "Food Spot saved successfully", isSaved: true };
        } else {
            await this._saveRepository.unSaveFoodSpot(id, foodSpotId);
            return { message: "Food Spot unsaved successfully", isSaved: false };
        }
    }

    async getSavedFoodSpots(id: string, page: number, limit: number): Promise<{ data: IFoodSpotResDto[], currentPage: number, totalPages: number, message: string }> {
        const skip = (page - 1) * limit;
        const result = await this._saveRepository.getSavedFoodSpots(id, skip, limit);
        if (!result || !result.datas) throw new AppError('spots are not found', STATUS_CODE.NOT_FOUND);

        const savedFoodSpots = ((result.datas as unknown as Record<string, unknown>).savedFoodSpots as never[]) || [];
        const totalPages = Math.ceil(result.totalCount / limit) || 1;

        return { data: allFoodSpotsMapper(savedFoodSpots), currentPage: page, totalPages, message: "Fetched saved food spots successfully" };
    }
}