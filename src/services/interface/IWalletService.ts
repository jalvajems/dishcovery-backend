import { IWalletTransactionDto } from "../../dtos/walletTransaction.dtos";

export interface IWalletTransactionService{
    getUserWallet(userId:string , role: "user"|"chef"):Promise<{transactions:IWalletTransactionDto[],balance:number}>
}