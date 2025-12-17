import { BlogModel, IBlogDocument } from "../../models/blog.model";
import { IBlogRepository } from "../interface/IBlogRepository";
import { BaseRepository } from "./base.repository";
import { Types } from "mongoose";

export class BlogRepository extends BaseRepository<IBlogDocument> implements IBlogRepository{
    constructor(){
        super(BlogModel)
    }
    async getBlogById(id: string): Promise<IBlogDocument|null> {
        return await BlogModel.findById(id).populate("chefId","name")
    }
    async getBlogByChef(chefId: string, skip: number, limit: number,search:string): Promise<{datas:IBlogDocument[]|null,totalCount:number}> {
  const chefObjId = new Types.ObjectId(chefId);

        const query:any={
              $and: [
      { chefId: chefObjId }
    ]
        }
        if(search){
            query.$or=[
                 { title: new RegExp(search, "i") },
                 { tags: new RegExp(search, "i") }
            ]
        }
        const blogs=await BlogModel.find(query).sort({createdAt:-1}).skip(skip).limit(limit);

        const totalCount=await BlogModel.countDocuments({chefId:chefId})
        return {datas:blogs,totalCount:totalCount}
    }
    async getAllBlogs(search: string, skip: number, limit: number,from:string): Promise<{ datas: IBlogDocument[] | null; totalCount: number; }> {
        if(from=='admin'){
            const query:any={}
            if(search){
                query.$or=[
                     { title: new RegExp(search, "i") },
                     { tags: new RegExp(search, "i") }
                ]
            }
            const blogs=await BlogModel.find(query).skip(skip).limit(limit).populate("chefId","name")
            const totalCount=await BlogModel.countDocuments(query);
            return {datas:blogs,totalCount:totalCount}
        }else if(from =='foodie'){
            const query:any={
                isBlocked:false
            }
            if(search){
                query.$or=[
                     { title: new RegExp(search, "i") },
                     { tags: new RegExp(search, "i") }
                ]
            }
            
            const blogs=await BlogModel.find(query).skip(skip).limit(limit).populate("chefId","name")
            const totalCount=await BlogModel.countDocuments(query);
            return {datas:blogs,totalCount:totalCount}
        }
    }
    async getRelatedBlog(tag: string): Promise<IBlogDocument[] | null> {
        return await BlogModel.find({tags:tag})
    }
    async blockById(id: string): Promise<IBlogDocument | null> {
        return await BlogModel.findByIdAndUpdate({_id:id},{$set:{isBlocked:true}},{new:true})
    }
    async unblockById(id: string): Promise<IBlogDocument | null> {
        return await BlogModel.findByIdAndUpdate({_id:id},{$set:{isBlocked:false}},{new:true})
    }
}