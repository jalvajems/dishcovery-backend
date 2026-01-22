import { Container } from "inversify";
import TYPES from "../types";
import { TransactionRepository } from "../../repostories/implementation/transaction.repository";
import { ITransactionRepository } from "../../repostories/interface/ITransactionRepository";
import { IWalletTransactionService } from "../../services/interface/IWalletService";
import { WalletTransactionService } from "../../services/implementation/wallet.service";
import { IWalletController } from "../../controllers/interface/IWalletController";
import { WalletController } from "../../controllers/implementation/wallet.controller";

export function transactionModule (container:Container){
    container.bind<ITransactionRepository>(TYPES.ITransactionRepository).to(TransactionRepository)
    container.bind<IWalletTransactionService>(TYPES.IWalletTransactionService).to(WalletTransactionService)
    container.bind<IWalletController>(TYPES.IWalletController).to(WalletController)
}