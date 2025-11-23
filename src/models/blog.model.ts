import { Schema, model } from "mongoose";

const blogSchema = new Schema(
  {
    chefId: {
      type: Schema.Types.ObjectId,
      ref: "Chef",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300, 
    },

    content: {
      type: String,
      required: true,
    },

    coverImage: {
      type: String,
      required: false,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    isDraft: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },

    // Optional SEO fields if needed later
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

export default model("Blog", blogSchema);
