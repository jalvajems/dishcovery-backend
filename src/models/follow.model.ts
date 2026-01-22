import { Document, model, Schema } from "mongoose";
import { IFollow } from "../types/follow.types";

export interface IFollowDocument extends IFollow, Document { }

const followSchema = new Schema<IFollowDocument>(
    {
        followerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        followingId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export const FollowModel = model<IFollowDocument>("Follow", followSchema);
