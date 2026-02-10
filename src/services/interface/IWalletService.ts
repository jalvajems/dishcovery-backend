import { IWalletTransactionDto } from "../../dtos/walletTransaction.dtos";

import { Role } from "../../types/user.types";

export interface IWalletTransactionService {
    getUserWallet(userId: string, role: Role): Promise<{
        transactions: IWalletTransactionDto[],
        balance: number,
        stats: { totalCredit: number; totalDebit: number; totalRefund: number }
    }>
}