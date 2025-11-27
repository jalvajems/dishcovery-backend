import { Types } from "mongoose";

export interface IReview {
  userId: string | Types.ObjectId;
  reviewableId: string | Types.ObjectId;
  reviewableType: "Recipe" | "Blog" | "Workshop" | "FoodSpot" | "Chef";
  rating: number;
  reviewText: string;
  likes: (string | Types.ObjectId)[];
  dislikes: (string | Types.ObjectId)[];
}
