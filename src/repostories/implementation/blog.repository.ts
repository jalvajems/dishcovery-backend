import { STATUS_CODE } from "../../constants/StatusCode";
import { BlogModel, IBlogDocument } from "../../models/blog.model";
import { AppError } from "../../utils/AppError";
import { IBlogRepository } from "../interface/IBlogRepository";
import { BaseRepository } from "./base.repository";
import { Types, FilterQuery } from "mongoose";

export class BlogRepository extends BaseRepository<IBlogDocument> implements IBlogRepository {
    constructor() {
        super(BlogModel)
    }
    async getBlogById(id: string): Promise<IBlogDocument | null> {
        return await BlogModel.findById(id).populate("chefId", "name")
    }
    async getBlogByChef(chefId: string, skip: number, limit: number, search: string): Promise<{ datas: IBlogDocument[] | null, totalCount: number }> {
        const chefObjId = new Types.ObjectId(chefId);

        const query: FilterQuery<IBlogDocument> = {
            $and: [
                { chefId: chefObjId }
            ]
        }
        if (search) {
            query.$or = [
                { title: new RegExp(search, "i") },
                { tags: new RegExp(search, "i") }
            ]
        }
        const blogs = await BlogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

        const totalCount = await BlogModel.countDocuments({ chefId: chefId })
        return { datas: blogs, totalCount: totalCount }
    }
    async getAllBlogs(search: string, skip: number, limit: number, from: string, filter?: string): Promise<{ datas: IBlogDocument[] | null, totalCount: number }> {
        if (from == 'admin') {
            const query: FilterQuery<IBlogDocument> = {}
            if (search) {
                query.$or = [
                    { title: new RegExp(search, "i") },
                    { tags: new RegExp(search, "i") }
                ]
            }
            if (filter) {
                query.tags = { $in: [new RegExp(filter, "i")] };
            }
            const blogs = await BlogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("chefId", "name")
            const totalCount = await BlogModel.countDocuments(query);
            return { datas: blogs, totalCount: totalCount }
        } else if (from == 'foodie') {
            const query: FilterQuery<IBlogDocument> = {
                isBlocked: false
            }
            if (search) {
                query.$or = [
                    { title: new RegExp(search, "i") },
                    { tags: new RegExp(search, "i") }
                ]
            }
            if (filter) {
                query.tags = { $in: [new RegExp(filter, "i")] };
            }

            const blogs = await BlogModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("chefId", "name")
            const totalCount = await BlogModel.countDocuments(query);
            return { datas: blogs, totalCount: totalCount }
        } else {
            throw new AppError('error in db', STATUS_CODE.INTERNAL_SERVER_ERROR)
        }
    }
    async getRelatedBlog(tag: string): Promise<IBlogDocument[] | null> {
        return await BlogModel.find({ tags: tag })
    }
    async blockById(id: string): Promise<IBlogDocument | null> {
        return await BlogModel.findByIdAndUpdate({ _id: id }, { $set: { isBlocked: true } }, { new: true })
    }
    async unblockById(id: string): Promise<IBlogDocument | null> {
        return await BlogModel.findByIdAndUpdate({ _id: id }, { $set: { isBlocked: false } }, { new: true })
    }
    async findRecent(limit: number): Promise<IBlogDocument[]> {
        return await BlogModel.find({ isBlocked: false })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate("chefId", "name");
    }
}