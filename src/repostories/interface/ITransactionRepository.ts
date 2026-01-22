import { ITransactionDocument } from "../../models/transaction.model";
import { IBaseRepository } from "./IBaseRepository";

export interface ITransactionRepository extends IBaseRepository<ITransactionDocument>{
    findByUser(userId: string, role: 'user' | 'chef'):Promise<ITransactionDocument[]|null>
    calculateBalance(userId: string, role: 'user' | 'chef'):Promise<number>;

}