import { Document, model, Schema, Types } from "mongoose";
import { IReview } from "../types/review.types";

export interface IReviewDocument extends IReview, Document {}

const reviewSchema = new Schema<IReviewDocument>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reviewableId: { type: Schema.Types.ObjectId, required: true },
  reviewableType: {
    type: String,
    enum: ["Recipe", "Blog", "Workshop", "FoodSpot", "Chef"],
    required: true,
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  reviewText: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: "Foodie", default: [] }],
  dislikes: [{ type: Schema.Types.ObjectId, ref: "Foodie", default: [] }],
}, { timestamps: true });

export const ReviewModel = model<IReviewDocument>("Review", reviewSchema);
