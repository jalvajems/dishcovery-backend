import { Types } from "mongoose";
import { ITransactionDocument, TransactionModel, WalletTransactionStatus, } from "../../models/transaction.model";
import { ITransactionRepository } from "../interface/ITransactionRepository";
import { BaseRepository } from "./base.repository";

export class TransactionRepository extends BaseRepository<ITransactionDocument> implements ITransactionRepository {
    constructor() {
        super(TransactionModel)
    }
    async findByUser(userId: string, role: "user" | "chef", page: number = 1, limit: number = 10): Promise<{ transactions: ITransactionDocument[], total: number }> {
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
    async getWalletStats(userId: string, role: "user" | "chef"): Promise<{
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
        // For Chef: Balance = Credits - (Debits + Refunds)
        // For User: Balance isn't strictly tracked as a "stored value" usually, but if it were:
        // User Wallet usually holds Credits (Refunds). Debits are payments. 
        // If we strictly follow Credit - Debit logic:
        // Chef: Credit (Earnings) - Debit (Withdrawal) - Refund (Deduction)
        const balance = role === 'chef'
            ? stats.totalCredit - (stats.totalDebit + stats.totalRefund)
            : stats.totalRefund - stats.totalDebit; // For foodie, this might be negative if they spent more than refunded, which is fine for "net spend".

        return {
            balance,
            totalCredit: stats.totalCredit,
            totalDebit: stats.totalDebit,
            totalRefund: stats.totalRefund
        };
    }

}