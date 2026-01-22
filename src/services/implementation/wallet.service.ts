import { inject, injectable } from "inversify";
import {  IWalletTransactionService } from "../interface/IWalletService";
import { IWalletTransactionDto } from "../../dtos/walletTransaction.dtos";
import TYPES from "../../DI/types";
import { TransactionRepository } from "../../repostories/implementation/transaction.repository";
import { walletTransactionMapper } from "../../utils/mapper/walletTransaction.mapper";
import { AppError } from "../../utils/AppError";
import { STATUS_CODE } from "../../constants/StatusCode";
import { allWalletTransactionMapper } from "../../utils/mapper/allTransaction.mapper";

@injectable()
export class WalletTransactionService implements IWalletTransactionService{
    constructor(
        @inject(TYPES.ITransactionRepository) private _transactionRepository: TransactionRepository,
    ){}
    async getUserWallet(userId: string, role: "user" | "chef"): Promise<{transactions:IWalletTransactionDto[],balance:number}> {
        try {
            const transaction= await this._transactionRepository.findByUser(userId,role)
            const balance= await this._transactionRepository.calculateBalance(userId,role)
            if(!transaction)throw new AppError('transactions are not found',STATUS_CODE.NOT_FOUND)
            return { transactions:allWalletTransactionMapper(transaction),balance}
        } catch (error) {
            throw error;
        }
    }
}