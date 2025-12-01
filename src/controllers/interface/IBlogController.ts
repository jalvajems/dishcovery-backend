import { NextFunction, Request, Response } from "express";

export interface IBlogController{
    createBlog(req:Request,res:Response,next:NextFunction):Promise<void>;
    updateBlog(req:Request,res:Response,next:NextFunction):Promise<void>;
    getBlogDetails(req:Request,res:Response,next:NextFunction):Promise<void>;
    getMyBlogs(req:Request,res:Response,next:NextFunction):Promise<void>;
    deletBlog(req:Request,res:Response,next:NextFunction):Promise<void>;
    getAllBlogs(req:Request,res:Response,next:NextFunction):Promise<void>;
    getRelatedBlogs(req:Request,res:Response,next:NextFunction):Promise<void>;
}