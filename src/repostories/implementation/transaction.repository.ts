import { Types } from "mongoose";
import { ITransactionDocument, TransactionModel, WalletTransactionStatus,  } from "../../models/transaction.model";
import { ITransactionRepository } from "../interface/ITransactionRepository";
import { BaseRepository } from "./base.repository";

export class TransactionRepository extends BaseRepository<ITransactionDocument> implements ITransactionRepository{
    constructor(){
        super(TransactionModel)
    }
    async findByUser(userId: string, role: "user" | "chef"): Promise<ITransactionDocument[]|null> {
        return await TransactionModel
        .find({userId:new Types.ObjectId(userId),role})
        .populate('workshopId','title')
        .sort({createdAt:-1}) ;                       
    }
    async calculateBalance(userId: string, role: "user" | "chef"): Promise<number> {
        const result = await TransactionModel.aggregate([
            {
                $match:{
                    userId:new Types.ObjectId(userId),
                    role,
                    status:WalletTransactionStatus.SUCCESS
                }
            },
            {
                $group:{
                    _id:null,
                    total:{$sum:'$amount'}
                }
            }
        ]);
        if (!result.length) return 0;

  return result[0].total;

    }

}