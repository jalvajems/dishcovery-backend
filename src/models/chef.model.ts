import  { Document, model, Schema } from "mongoose";
import { IChef } from "../types/chef.types";

export interface IChefDocument extends IChef,Document{}

const chefSchema = new Schema<IChefDocument>(
  {
chefId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },


    phone: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      required: true,
    },

    specialities: {
      type: [String],
      required: true,
    },

    bio: {
      type: String,
      trim: true,
    },

    image: {
      type: String, 
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const ChefModel= model<IChefDocument> ("Chef", chefSchema);
