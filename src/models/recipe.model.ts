import { model, Schema } from "mongoose";
import { IRecipe } from "../types/recipe.types";
import { Document } from "mongoose";

export interface IRecipeDocument extends IRecipe,Document{};

const recipeSchema = new Schema<IRecipeDocument>(
  {
    chefId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    cuisine: {
      type: String,
      required: true,
    },

    cookingTime: {
      type: Number, 
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    dietType: {
      type: [String],
      default: [],
    },

    ingredients: {
      type: [String],
      required: true,
      default: [],
    },

    steps: {
      type: [String],
      required: true,
      default: [],
    },

    images: {
      type: [String],
      default: [],
    },

    isDraft: {
      type: Boolean,
      default: true,
    },

    isBlock: {
      type:Boolean,
      default:true,
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const RecipeModel= model<IRecipeDocument>("Recipe", recipeSchema);
