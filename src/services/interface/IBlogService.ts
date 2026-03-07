import { IBlogDto } from "../../dtos/blog.dto";
import { IBlog } from "../../types/blog.types";

export interface IBlogService {
    createBlog(data: IBlog): Promise<{ data: IBlogDto, message: string }>;
    updateBlog(blogId: string, data: Partial<IBlog>): Promise<{ data: IBlogDto, message: string }>
    getBlog(blogId: string): Promise<{ data: IBlogDto, message: string }>;
    deleteBlog(blogId: string): Promise<{ message: string }>;
    getBlogOfChef(chefId: string, page: number, limit: number, search: string): Promise<{ datas: IBlogDto[], totalCount: number, message: string }>;
    getAllblogs(page: number, limit: number, search: string, filter?: string): Promise<{ datas: IBlogDto[], totalCount: number }>;
    getRelatedBlogs(tag: string): Promise<{ datas: IBlogDto[] }>
    getRecentBlogs(limit: number): Promise<{ data: IBlogDto[] }>;
    toggleSaveBlog(id: string, blogId: string): Promise<{ message: string, isSaved: boolean }>;
    getSavedBlogs(id: string, page: number, limit: number): Promise<{ data: IBlogDto[], currentPage: number, totalPages: number, message: string }>;
}