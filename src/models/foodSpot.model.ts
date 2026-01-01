import { Schema, model,Document } from "mongoose";
import { IFoodSpot } from "../types/foodSpot.types";

export interface IFoodSpotDocument extends IFoodSpot,Document{}

const FoodSpotSchema = new Schema<IFoodSpotDocument>(
  {

    foodieId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

   
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },
    coverImage:{
      type:String,
      require:true
    },

   
    // images: {
    //   type: [String],
    //   required: true,
    //   default:[]
    // //   validate: [(val: string[]) => val.length > 0, "At least one image required"],
    // },

    // GeoJSON location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    address: {
      placeName: String,
      city: String,
      state: String,
      country: String,
      fullAddress: String,
    },

    exploredFoods: [
      {
        name: { type: String, required: true },
        price: Number,
        image:{type:String,required:true}
      },
    ],

    speciality: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      index: true,
    },
     openingHours: {
      open: String,  // "10:00 AM"
      close: String, // "10:00 PM"
      isOpenNow: Boolean,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    savesCount: {
      type: Number,
      default: 0,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

FoodSpotSchema.index({ location: "2dsphere" });

export const FoodSpotModel = model("FoodSpot", FoodSpotSchema);
