import { inject, injectable } from "inversify";
import { IBlogController } from "../interface/IBlogController";
import TYPES from "../../DI/types";
import { IBlogService } from "../../services/interface/IBlogService";
import { Request, Response, NextFunction } from "express";
import { STATUS_CODE } from "../../constants/StatusCode";
import { AppError } from "../../utils/AppError";
import { BLOG_MESSAGES, MESSAGES } from "../../constants/Message";

@injectable()
export class BlogController implements IBlogController {
    constructor(
        @inject(TYPES.IBlogService) private _blogService: IBlogService,
    ) { }
    async createBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const chefId = req.user?.id;
            const result = await this._blogService.createBlog({ chefId, ...req.body })
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, message: result.message })
        } catch (error) {
            next(error)
        }
    }
    async updateBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const blogId = req.params.id;
            const newData = req.body;
            const result = await this._blogService.updateBlog(blogId, newData)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, message: result.message });
        } catch (error) {
            next(error)
        }
    }
    async deletBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log('reached delet');

        try {
            const blogId = req.params.blogId;
            const result = await this._blogService.deleteBlog(blogId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, message: result.message })
        } catch (error) {
            next(error)
        }
    }
    async getMyBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log('reached1============');
        try {

            const chefId = req.user?.id;

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 5;
            const search = String(req.query.search) || '';
            if (!chefId) throw new AppError(MESSAGES.AUTH.UNAUTHORIZED, STATUS_CODE.UNAUTHORIZED)
            const result = await this._blogService.getBlogOfChef(chefId, page, limit, search)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result.datas, totalCount: result.totalCount, message: result.message })
        } catch (error) {
            next(error)
        }
    }

    async getBlogDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log('------1');

        try {
            const blogId = req.params.blogId;
            const result = await this._blogService.getBlog(blogId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, data: result.data, message: result.message })
        } catch (error) {
            next(error)
        }
    }
    async getAllBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 5;
            const search = String(req.query.search) || "";
            const filter = String(req.query.filter) || "";

            const result = await this._blogService.getAllblogs(page, limit, search, filter);

            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result.datas, totalCount: result.totalCount, message:BLOG_MESSAGES.FETCH_SUCCESS })
        } catch (error) {
            next(error)
        }
    }
    async getRelatedBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const tag = req.params.tag;
            if (!tag) throw new AppError("no tag found in req", STATUS_CODE.BAD_REQUEST)
            const result = await this._blogService.getRelatedBlogs(tag)
            res.status(STATUS_CODE.SUCCESS).json({ success: true, relatedDatas: result.datas, message: BLOG_MESSAGES.FETCH_SUCCESS })
        } catch (error) {
            next(error);
        }
    }

    async getBlogsByChef(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { chefId } = req.params;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 6;
            const search = String(req.query.search) || "";
            const result = await this._blogService.getBlogOfChef(chefId, page, limit, search);
            res.status(STATUS_CODE.SUCCESS).json({
                success: true,
                datas: result.datas,
                totalCount: result.totalCount,
                currentPage: page,
                totalPages: Math.ceil(result.totalCount / limit)
            });
        } catch (error) {
            next(error);
        }
    }
    async getRecentBlogs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const limit = Number(req.query.limit) || 3;
            const result = await this._blogService.getRecentBlogs(limit);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result.data, message: BLOG_MESSAGES.FETCH_SUCCESS });
        } catch (error) {
            next(error);
        }
    }
}