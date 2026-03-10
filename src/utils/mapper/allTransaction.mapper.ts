import { IWalletTransactionDto } from "../../dtos/walletTransaction.dtos";
import { ITransactionDocument } from "../../models/transaction.model";
import { walletTransactionMapper } from "./walletTransaction.mapper";

export function allWalletTransactionMapper(transactions:(ITransactionDocument)[]):IWalletTransactionDto[]{
    return transactions.map(transaction=>walletTransactionMapper(transaction))
}