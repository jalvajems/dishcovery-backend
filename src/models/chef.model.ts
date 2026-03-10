import  { model, Schema } from "mongoose";

const chefSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      required: true,
    },

    speciality: {
      type: String,
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

export default model("Chef", chefSchema);
