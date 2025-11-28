import { Document } from "mongoose";
import { IBlog } from "../../types/blog.types";
import { IBlogDto } from "../../dtos/blog.dto";
import { blogMapper } from "./blog.mapper";

export function allBlogsMapper(blogs:(IBlog&Document)[]):IBlogDto[]{
    return blogs.map(blog=>blogMapper(blog))
}