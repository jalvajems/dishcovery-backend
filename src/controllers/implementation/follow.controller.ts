import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import TYPES from "../../DI/types";
import { IFollowService } from "../../services/interface/IFollowService";
import { STATUS_CODE } from "../../constants/StatusCode";

@injectable()
export class FollowController {
    constructor(
        @inject(TYPES.IFollowService) private _followService: IFollowService
    ) { }

    async follow(req: Request, res: Response, next: NextFunction) {
        try {
            const followerId = req.user?.id; 
            const { followingId } = req.body;

            if (followerId === followingId) {
                return res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: "You cannot follow yourself" });
            }

            const result = await this._followService.follow(followerId as string, followingId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result, message: "Followed successfully" });
        } catch (error) {
            next(error);
        }
    }

    async unfollow(req: Request, res: Response, next: NextFunction) {
        try {
            const followerId = req.user?.id;
            const { followingId } = req.body;

            const result = await this._followService.unfollow(followerId as string, followingId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result, message: "Unfollowed successfully" });
        } catch (error) {
            next(error);
        }
    }

    async isFollowing(req: Request, res: Response, next: NextFunction) {
        try {
            const followerId = req.user?.id;
            const { followingId } = req.params;

            const result = await this._followService.isFollowing(followerId as string, followingId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result });
        } catch (error) {
            next(error);
        }
    }

    async getFollowerList(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await this._followService.getFollowers(userId as string, page, limit);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result.followers, total: result.total });
        } catch (error) {
            next(error);
        }
    }

    async getFollowingList(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const result = await this._followService.getFollowing(userId as string, page, limit, search);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result.following, total: result.total });
        } catch (error) {
            next(error);
        }
    }

    async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const stats = await this._followService.getFollowStats(userId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: stats });
        } catch (error) {
            next(error);
        }
    }

    async getFoodieProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const { foodieId } = req.params;
            const result = await this._followService.getFoodieProfile(foodieId);
            res.status(STATUS_CODE.SUCCESS).json({ success: true, datas: result });
        } catch (error) {
            next(error);
        }
    }
}
