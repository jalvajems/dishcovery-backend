import { inject, injectable } from "inversify";
import { IBlogService } from "../interface/IBlogService";
import { Role } from "../../types/user.types";
import TYPES from "../../DI/types";
import { IBlogDto } from "../../dtos/blog.dto";
import { IBlog } from "../../types/blog.types";
import { blogMapper } from "../../utils/mapper/blog.mapper";
import { IBlogRepository } from "../../repostories/interface/IBlogRepository";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { allBlogsMapper } from "../../utils/mapper/allBlogs.mapper";
import { BLOG_MESSAGES } from "../../constants/Message";

@injectable()
export class BlogService implements IBlogService {
    constructor(
        @inject(TYPES.IBlogRepository) private _blogRepositoy: IBlogRepository
    ) { }

    async createBlog(data: IBlog): Promise<{ data: IBlogDto; message: string; }> {
        const result = await this._blogRepositoy.create(data);
        return { data: blogMapper(result), message:  BLOG_MESSAGES.CREATED}
    }
    async updateBlog(blogId: string, data: Partial<IBlog>): Promise<{ data: IBlogDto; message: string; }> {
        const result = await this._blogRepositoy.updateById(blogId, data);
        if (!result) throw new AppError('updated blog data is empty', STATUS_CODE.NOT_FOUND);
        return { data: blogMapper(result), message:  BLOG_MESSAGES.UPDATED}
    }
    async getBlog(blogId: string): Promise<{ data: IBlogDto; message: string; }> {
        const result = await this._blogRepositoy.getBlogById(blogId);
        if (!result) throw new AppError(BLOG_MESSAGES.BLOG_NOT_FOUND, STATUS_CODE.NOT_FOUND)
        return { data: blogMapper(result), message: BLOG_MESSAGES.FETCH_SUCCESS }
    }
    async getBlogOfChef(chefId: string, page: number, limit: number, search: string): Promise<{ datas: IBlogDto[]; totalCount: number; message: string; }> {
        const skip = (page - 1) * limit
        const result = await this._blogRepositoy.getBlogByChef(chefId, skip, limit, search)
        if (!result.datas) throw new AppError(BLOG_MESSAGES.BLOG_NOT_FOUND, STATUS_CODE.NOT_FOUND)
        const total = Math.ceil(result.totalCount / limit)
        return { datas: allBlogsMapper(result.datas), totalCount: total, message:BLOG_MESSAGES.FETCH_SUCCESS }
    }
    async deleteBlog(blogId: string): Promise<{ message: string; }> {
        console.log('delt servic');

        await this._blogRepositoy.deleteByFilter({ _id: blogId })
        return { message: BLOG_MESSAGES.DELETED }
    }
    async getAllblogs(page: number, limit: number, search: string, filter?: string): Promise<{ datas: IBlogDto[]; totalCount: number; }> {
        console.log('reached getallblog');
        const skip = (page - 1) * limit
        const result = await this._blogRepositoy.getAllBlogs(search, skip, limit, Role.FOODIE, filter)
        if (!result.datas) throw new AppError(BLOG_MESSAGES.BLOG_NOT_FOUND, STATUS_CODE.NOT_FOUND);
        const total = Math.ceil(result.totalCount / limit)
        console.log('total', total);

        return { datas: allBlogsMapper(result.datas), totalCount: total }
    }
    async getRelatedBlogs(tag: string): Promise<{ datas: IBlogDto[]; }> {
        const result = await this._blogRepositoy.getRelatedBlog(tag)
        if (!result) throw new AppError(BLOG_MESSAGES.BLOG_NOT_FOUND, STATUS_CODE.NOT_FOUND)
        return { datas: allBlogsMapper(result) }
    }

    async getRecentBlogs(limit: number): Promise<{ data: IBlogDto[]; }> {
        const result = await this._blogRepositoy.findRecent(limit);
        if (!result) throw new AppError(BLOG_MESSAGES.BLOG_NOT_FOUND, STATUS_CODE.NOT_FOUND);
        return { data: allBlogsMapper(result) };
    }
}