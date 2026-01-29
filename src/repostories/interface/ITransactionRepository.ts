import { ITransactionDocument } from "../../models/transaction.model";
import { IBaseRepository } from "./IBaseRepository";

export interface ITransactionRepository extends IBaseRepository<ITransactionDocument> {
    findByUser(userId: string, role: 'user' | 'chef', page?: number, limit?: number): Promise<{ transactions: ITransactionDocument[], total: number }>
    getWalletStats(userId: string, role: 'user' | 'chef'): Promise<{
        balance: number;
        totalCredit: number;
        totalDebit: number;
        totalRefund: number;
    }>;

}