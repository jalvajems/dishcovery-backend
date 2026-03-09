import { model, Schema, Document } from "mongoose";
import { IUser, Role } from "../types/user.types";

export interface IUserDocument extends IUser, Document { }

const userSchema = new Schema<IUserDocument>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String, required: false },
        googleId: { type: String, unique: true, sparse: true },
        profilePicture: { type: String },
        role: { type: String, enum: Object.values(Role), default: Role.USER },
        isVerified: { type: Boolean, default: false },
        isBlocked: { type: Boolean, default: false },
        savedRecipes: [
            {
                type: Schema.Types.ObjectId,
                ref: "Recipe",
                default: [],
            },
        ],
        savedBlogs: [
            {
                type: Schema.Types.ObjectId,
                ref: "Blog",
                default: [],
            }
        ],
        savedFoodSpots: [
            {
                type: Schema.Types.ObjectId,
                ref: "FoodSpot",
                default: [],
            }
        ]
    },
    { timestamps: true }
);
userSchema.set("toObject",{virtuals:true})
userSchema.set("toJSON",{virtuals:true})

userSchema.virtual("foodieProfile", {
  ref: "Foodie",
  localField: "_id",
  foreignField: "userId",
  justOne: true
});
export const UserModel = model<IUserDocument>('User', userSchema);