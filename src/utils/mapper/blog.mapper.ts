import { Document } from "mongoose";
import { IBlog } from "../../types/blog.types";
import { IBlogDto } from "../../dtos/blog.dto";

export function blogMapper(blog:IBlog&Document):IBlogDto{
    const obj=blog.toObject()
    return{
          chefId: {
            id: obj.chefId?._id,
            name: obj.chefId?.name
        },
        _id:obj._id.toString(),
        title:obj.title,
        shortDescription:obj.shortDescription,
        content:obj.content,
        coverImage:obj.coverImage,
        tags:obj.tags,
        isDraft:obj.isDraft,
        status:obj.status,
        slug:obj.slug,
        createdAt:obj.createdAt,
        updatedAt:obj.updatedAt
    }
}