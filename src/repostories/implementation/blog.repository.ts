import { BlogModel, IBlogDocument } from "../../models/blog.model";
import { IBlogRepository } from "../interface/IBlogRepository";
import { BaseRepository } from "./base.repository";

export class BlogRepository extends BaseRepository<IBlogDocument> implements IBlogRepository{
    constructor(){
        super(BlogModel)
    }
    async getBlogById(id: string): Promise<IBlogDocument|null> {
        return await BlogModel.findById(id).populate("chefId","name")
    }
    async getBlogByChef(chefId: string, skip: number, limit: number): Promise<{datas:IBlogDocument[]|null,totalCount:number}> {
        const blogs=await BlogModel.find({chefId}).sort({createdAt:-1}).skip(skip).limit(limit);

        const totalCount=await BlogModel.countDocuments({chefId})
        return {datas:blogs,totalCount:totalCount}
    }
    async getAllBlogs(search: string, skip: number, limit: number): Promise<{ datas: IBlogDocument[] | null; totalCount: number; }> {
        const query:any={}
        if(search){
            query.$or=[
                 { title: new RegExp(search, "i") },
                 { tags: new RegExp(search, "i") }
            ]
        }
        const blogs=await BlogModel.find(query).skip(skip).limit(limit);
        const totalCount=await BlogModel.countDocuments(query);
        return {datas:blogs,totalCount:totalCount}
    }
    async getRelatedBlog(tag: string): Promise<IBlogDocument[] | null> {
        return await BlogModel.find({tags:tag})
    }
}