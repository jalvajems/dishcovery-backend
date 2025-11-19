import { inject, injectable } from "inversify";
import { IFoodieService } from "../interface/IFoodieService";
import TYPES from "../../DI/types";
import { IFoodieRepository } from "../../repostories/interface/IFoodieRepository";
import { IFoodie } from "../../types/foodie.types";
import foodieMapper from '../../utils/mapper/foodie.mapper'
import { IFoodieDto } from "../../dtos/foodie.dtos";

@injectable()
export class FoodieService implements IFoodieService {
    constructor(
        @inject(TYPES.IFoodieRepository) private _foodieRepository: IFoodieRepository,
    ) { }


    async editFoodieProfile(userId: string, foodieData: IFoodieDto): Promise<{ message: string; foodieData: IFoodieDto | IFoodie | null; }> {
        try {
            const existingFoodie = await this._foodieRepository.findByUserId(userId);
            if (!existingFoodie) {
                const newFoodie = await this._foodieRepository.create(foodieData);
                return { message: 'foodie profile data created', foodieData: foodieMapper(newFoodie) };
            }
            const updateFoodie = await this._foodieRepository.findOneUpdateFoodie(userId, foodieData);
            return { message: 'foodie profile updated', foodieData: updateFoodie }

        } catch (error) {
            throw new Error('Error in edit foodie profile service:');
        }
    }
}