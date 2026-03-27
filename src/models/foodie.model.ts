import  { Document, model, Schema } from 'mongoose';
import { IFoodie } from '../types/foodie.types';

export interface IFoodieDocument extends IFoodie,Document{}
const foodieSchema=new Schema<IFoodieDocument>({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true,
    },
    phone:{type:String,trim:true},
    location: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    address: { type: String, required: true },
    preferences: {
        recipeCategory: { type: [String], default: [] },
        blogTags: { type: [String], default: [] }
    },
    bio: {type: String,trim: true},
    image: {type: String},
    status: {type: String,enum: ["active", "blocked"],default: "active"},
  },
  { timestamps: true }
);

foodieSchema.index({ location: "2dsphere" });

export const FoodieModel= model<IFoodieDocument>("Foodie",foodieSchema)
