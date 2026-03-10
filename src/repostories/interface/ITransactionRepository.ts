import { ITransactionDocument } from "../../models/transaction.model";
import { IBaseRepository } from "./IBaseRepository";

import { Role } from "../../types/user.types";

export interface ITransactionRepository extends IBaseRepository<ITransactionDocument> {
    findByUser(userId: string, role: Role, page?: number, limit?: number): Promise<{ transactions: ITransactionDocument[], total: number }>
    getWalletStats(userId: string, role: Role): Promise<{
        balance: number;
        totalCredit: number;
        totalDebit: number;
        totalRefund: number;
    }>;

}