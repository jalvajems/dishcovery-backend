
import { inject, injectable } from "inversify";
import { IWalletTransactionService } from "../interface/IWalletService";
import { IWalletTransactionDto } from "../../dtos/walletTransaction.dtos";
import TYPES from "../../DI/types";
import { TransactionRepository } from "../../repostories/implementation/transaction.repository";
import { allWalletTransactionMapper } from "../../utils/mapper/allTransaction.mapper";
import { Role } from "../../types/user.types";

@injectable()
export class WalletTransactionService implements IWalletTransactionService {
    constructor(
        @inject(TYPES.ITransactionRepository) private _transactionRepository: TransactionRepository,
    ) { }
    async getUserWallet(userId: string, role: Role, page: number = 1, limit: number = 10): Promise<{
        transactions: IWalletTransactionDto[],
        balance: number,
        stats: { totalCredit: number; totalDebit: number; totalRefund: number },
        totalPages: number,
        currentPage: number
    }> {
        const { transactions, total } = await this._transactionRepository.findByUser(userId, role, page, limit)
        const stats = await this._transactionRepository.getWalletStats(userId, role)

        return {
            transactions: allWalletTransactionMapper(transactions),
            balance: stats.balance,
            stats,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }
    }
}