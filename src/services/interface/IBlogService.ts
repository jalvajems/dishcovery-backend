import { IBlogDto } from "../../dtos/blog.dto";
import { IBlog } from "../../types/blog.types";

export interface IBlogService {
    createBlog(data:IBlog):Promise<{data:IBlogDto,message:string}>;
    updateBlog(blogId:string,data:any):Promise<{data:IBlogDto,message:string}>
    getBlog(blogId:string):Promise<{data:IBlogDto,message:string}>;
    deleteBlog(blogId:string):Promise<{message:string}>;
    getBlogOfChef(chefId:string,page:number,limit:number):Promise<{datas:IBlogDto[],totalCount:number,message:string}>;

}