import { Types, FilterQuery } from "mongoose";
import { FoodSpotModel, IFoodSpotDocument } from "../../models/foodSpot.model";
import { IFoodSpotRepository } from "../interface/IFoodSportRepository";
import { BaseRepository } from "./base.repository";
import { IFoodSpot } from "../../types/foodSpot.types";

export class FoodSpotRepository extends BaseRepository<IFoodSpotDocument> implements IFoodSpotRepository {
    constructor() {
        super(FoodSpotModel)
    }

    async findFoodSpot(id: string): Promise<IFoodSpotDocument | null> {


        const result = await FoodSpotModel.findOne({ _id: id }).populate("foodieId", "name")
        return result;
    }
    async findNearByFoodSpot(lat: number, lng: number, maxDistance: number): Promise<IFoodSpotDocument[] | null> {
        return FoodSpotModel.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat],
                    },
                    $maxDistance: maxDistance,
                },
            },
            isApproved: true,
            isDeleted: false,
        })
            .populate("foodieId", "name email ")
    }
    async findAllFoodSpots(search: string, skip: number, limit: number, filter?: string, coordinates?: [number, number]): Promise<{ datas: IFoodSpotDocument[] | null; totalCount: number; }> {

        const query: FilterQuery<IFoodSpotDocument> = {
            isBlocked: false,
            isApproved: true
        }

        if (search) {
            query.$or = [
                { name: new RegExp(search, "i") },
                { tags: new RegExp(search, "i") }
            ]
        }
        if (filter) {
            query.tags = { $in: [new RegExp(filter, "i")] };
        }

        // If coordinates are provided, use $geoNear aggregation
        if (coordinates && coordinates.length === 2) {
            const pipeline: any[] = [
                {
                    $geoNear: {
                        near: { type: "Point", coordinates },
                        distanceField: "distance",
                        spherical: true,
                        query: query
                    }
                },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: "users",
                        localField: "foodieId",
                        foreignField: "_id",
                        as: "foodieId"
                    }
                },
                { $unwind: "$foodieId" }
            ];

            const spots = await FoodSpotModel.aggregate(pipeline);
            const totalCount = await FoodSpotModel.countDocuments(query);
            return { datas: spots as any, totalCount };
        }

        // Default sorting by proximity to recent
        const spots = await FoodSpotModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('foodieId', 'name')
        const totalCount = await FoodSpotModel.countDocuments(query)
        return { datas: spots, totalCount }
    }
    async findAllFoodSpotsAdmin(filter: object, skip: number, limit: number): Promise<{ datas: IFoodSpotDocument[] | null; totalCount: number; }> {
        const spots = await FoodSpotModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('foodieId', 'name')
        const totalCount = await FoodSpotModel.countDocuments(filter)
        return { datas: spots, totalCount }
    }
    async findAllFoodSpotsByFoodie(foodieId: string, search: string, skip: number, limit: number): Promise<{ datas: IFoodSpotDocument[] | null; totalCount: number; }> {
        const id = new Types.ObjectId(foodieId);

        const query: FilterQuery<IFoodSpotDocument> = {
            $and: [
                { foodieId: id }
            ]
        }
        if (search) {
            query.$or = [
                { name: new RegExp(search, "i") },
                { tags: new RegExp(search, "i") }
            ]
        }
        const spots = await FoodSpotModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

        const totalCount = await FoodSpotModel.countDocuments({ foodieId: id })
        return { datas: spots, totalCount: totalCount }
    }
    async blockById(id: string): Promise<(IFoodSpot & Document) | null> {
        return await FoodSpotModel.findByIdAndUpdate({ _id: id }, { $set: { isBlocked: true } }, { new: true })
    }
    async unblockById(id: string): Promise<(IFoodSpot & Document) | null> {
        return await FoodSpotModel.findByIdAndUpdate({ _id: id }, { $set: { isBlocked: false } }, { new: true })
    }
    async approveById(id: string): Promise<(IFoodSpot & Document) | null> {
        return await FoodSpotModel.findByIdAndUpdate({ _id: id }, { $set: { isApproved: true } }, { new: true })
    }
    async unAproveById(id: string): Promise<(IFoodSpot & Document) | null> {
        return await FoodSpotModel.findByIdAndUpdate({ _id: id }, { $set: { isApproved: false } }, { new: true })
    }
    async findRecent(limit: number): Promise<IFoodSpotDocument[]> {
        return await FoodSpotModel.find({ isBlocked: false, isApproved: true })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("foodieId", "name");
    }

}