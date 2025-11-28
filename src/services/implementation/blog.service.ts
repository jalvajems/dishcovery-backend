import { inject, injectable } from "inversify";
import { IBlogService } from "../interface/IBlogService";
import TYPES from "../../DI/types";
import { IBlogDto } from "../../dtos/blog.dto";
import { IBlog } from "../../types/blog.types";
import { blogMapper } from "../../utils/mapper/blog.mapper";
import { IBlogRepository } from "../../repostories/interface/IBlogRepository";
import { da } from "zod/v4/locales";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { skip } from "node:test";
import { allBlogsMapper } from "../../utils/mapper/allBlogs.mapper";
import { log } from "console";

@injectable()
export class BlogService implements IBlogService{
    constructor(
        @inject(TYPES.IBlogRepository) private _blogRepositoy:IBlogRepository
    ){}

    async createBlog(data: IBlog): Promise<{ data: IBlogDto; message: string; }> {
        try {
            const result=await this._blogRepositoy.create(data);
            return {data:blogMapper(result),message:'blog created successfully'}
        } catch (error) {
            throw error;
        }
    }
    async updateBlog(blogId: string, data: any): Promise<{ data: IBlogDto; message: string; }> {
        try {
            const result=await this._blogRepositoy.updateById(blogId,data);
            if(!result)throw new AppError('updated blog data is empty',STATUS_CODE.NOT_FOUND);
            return {data:blogMapper(result),message:'blog updated successfully!'}
        } catch (error) {
            throw error;
        }
    }
    async getBlog(blogId: string): Promise<{ data: IBlogDto; message: string; }> {
        try {
            const result=await this._blogRepositoy.getBlogById(blogId);
            if(!result)throw new AppError('No blog on that id is found',STATUS_CODE.NOT_FOUND)
            return {data:blogMapper(result),message:'blog fetch succefully'}
        } catch (error) {
            throw error;
        }
    }
    async getBlogOfChef(chefId: string, page: number, limit: number): Promise<{ datas: IBlogDto[];totalCount:number; message: string; }> {
        try {
            const skip=(page-1)*limit
            const result=await this._blogRepositoy.getBlogByChef(chefId,skip,limit)    
            if(!result.datas)throw new AppError('No blogs found',STATUS_CODE.NOT_FOUND)
            const total=Math.ceil(result.totalCount/limit)
            return {datas:allBlogsMapper(result.datas),totalCount:total,message:'blog fetch successfuly'}        
        } catch (error) {
            throw error
        }
    }
    async deleteBlog(blogId: string): Promise<{ message: string; }> {
        try {
            console.log('delt servic');
            
            await this._blogRepositoy.deleteByFilter({_id:blogId})
            return {message:'blog deleted!!'}
        } catch (error) {
            throw error;
        }
    }

}