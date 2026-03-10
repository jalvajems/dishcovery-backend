import { inject, injectable } from "inversify";
import { IWalletController } from "../interface/IWalletController";
import TYPES from "../../DI/types";
import { WalletTransactionService } from "../../services/implementation/wallet.service";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { Role } from "../../types/user.types";

@injectable()
export class WalletController implements IWalletController {
    constructor(
        @inject(TYPES.IWalletTransactionService) private _walletTransactionService: WalletTransactionService,
    ) { }

    async chefWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {

            const chefId = req.user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            console.log('reached chef walcontr');
            if (!chefId) throw new AppError('user is not authenticated', STATUS_CODE.UNAUTHORIZED)
            const data = await this._walletTransactionService.getUserWallet(chefId, Role.CHEF, page, limit);
            res.json({ success: true, data })
        } catch (error) {
            next(error)
        }
    }
    async foodieWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            if (!userId) throw new AppError('user is not authenticated', STATUS_CODE.UNAUTHORIZED)
            const data = await this._walletTransactionService.getUserWallet(userId, Role.USER, page, limit);
            res.json({ success: true, data })
        } catch (error) {
            next(error);
        }
    }
}