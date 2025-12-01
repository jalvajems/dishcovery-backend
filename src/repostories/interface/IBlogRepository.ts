import { IBlogDocument } from "../../models/blog.model";
import { IBlog } from "../../types/blog.types";
import { IBaseRepository } from "./IBaseRepository";

export interface IBlogRepository extends IBaseRepository<IBlogDocument>{
    getBlogById(id:string):Promise<IBlogDocument|null>;
    getBlogByChef(chefId:string, skip:number, limit:number):Promise<{datas:IBlogDocument[]|null,totalCount:number}>
    getAllBlogs(search:string,skip:number, limit:number):Promise<{datas:IBlogDocument[]|null,totalCount:number}>;
    getRelatedBlog(tag:string):Promise<IBlogDocument[]|null>

}