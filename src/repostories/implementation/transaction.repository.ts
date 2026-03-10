import { Types } from "mongoose";
import { ITransactionDocument, TransactionModel, WalletTransactionStatus, } from "../../models/transaction.model";
import { ITransactionRepository } from "../interface/ITransactionRepository";
import { BaseRepository } from "./base.repository";
import { Role } from "../../types/user.types";

export class TransactionRepository extends BaseRepository<ITransactionDocument> implements ITransactionRepository {
    constructor() {
        super(TransactionModel)
    }
    async findByUser(userId: string, role: Role, page: number = 1, limit: number = 10): Promise<{ transactions: ITransactionDocument[], total: number }> {
        const skip = (page - 1) * limit;
        const query = { userId: new Types.ObjectId(userId), role };

        const [transactions, total] = await Promise.all([
            TransactionModel
                .find(query)
                .populate({
                    path: 'bookingId',
                    populate: {
                        path: 'foodieId',
                        select: 'name email'
                    }
                })
                .populate({
                    path: 'workshopId',
                    select: 'title chefId',
                    populate: {
                        path: 'chefId',
                        select: 'name'
                    }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            TransactionModel.countDocuments(query)
        ]);

        return { transactions, total };
    }
    async getWalletStats(userId: string, role: Role): Promise<{
        balance: number;
        totalCredit: number;
        totalDebit: number;
        totalRefund: number;
    }> {
        const result = await TransactionModel.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(userId),
                    role,
                    status: WalletTransactionStatus.SUCCESS
                }
            },
            {
                $group: {
                    _id: null,
                    totalCredit: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0]
                        }
                    },
                    totalDebit: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0]
                        }
                    },
                    totalRefund: {
                        $sum: {
                            $cond: [{ $eq: ["$type", "REFUND"] }, "$amount", 0]
                        }
                    }
                }
            }
        ]);

        if (!result.length) {
            return {
                balance: 0,
                totalCredit: 0,
                totalDebit: 0,
                totalRefund: 0
            };
        }

        const stats = result[0];
        const balance = role === Role.CHEF
            ? stats.totalCredit - (stats.totalDebit + stats.totalRefund)
            : stats.totalRefund - stats.totalDebit;

        return {
            balance,
            totalCredit: stats.totalCredit,
            totalDebit: stats.totalDebit,
            totalRefund: stats.totalRefund
        };
    }

}