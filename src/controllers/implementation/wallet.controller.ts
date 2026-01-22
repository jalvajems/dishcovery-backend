import { inject, injectable } from "inversify";
import { IWalletController } from "../interface/IWalletController";
import TYPES from "../../DI/types";
import { WalletTransactionService } from "../../services/implementation/wallet.service";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { success } from "zod";

@injectable()
export class WalletController implements IWalletController{
    constructor(
        @inject(TYPES.IWalletTransactionService) private _walletTransactionService:WalletTransactionService,
    ){}

    async chefWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            
            const chefId=req.user?.id;
            console.log('reached chef walcontr');
            if(!chefId)throw new AppError('user is not authenticated',STATUS_CODE.UNAUTHORIZED)
                const data=await this._walletTransactionService.getUserWallet(chefId,'chef');
            res.json({success:true,data})
        } catch (error) {
            next(error)
        }
    }
    async foodieWallet(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId=req.user?.id;
            if(!userId)throw new AppError('user is not authenticated',STATUS_CODE.UNAUTHORIZED)
            const data=await this._walletTransactionService.getUserWallet(userId,'user');
            res.json({success:true,data})
        } catch (error) {
            next(error);
        }
    }
}