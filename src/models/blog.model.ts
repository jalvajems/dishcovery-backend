import { Document, Schema, model } from "mongoose";
import { IBlog } from "../types/blog.types";

export interface IBlogDocument extends IBlog,Document{}

const blogSchema = new Schema(
  {
    chefId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index:true
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
      index:true,
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
      index:true
    },

    // Optional SEO fields if needed later
    slug: {
      type: String,
      unique: true,
      sparse: true,
      index:true,
    },
    likes: {
      type: Number,
      default: 0,
    },

    views: {
      type: Number,
      default: 0,
    },

  },
  { timestamps: true }
);
// blogSchema.pre("save", function (next) {
//   if (this.isModified("title")) {
//     this.slug = slugify(this.title, { lower: true, strict: true });
//   }
//   next();
// });


export const BlogModel= model<IBlogDocument>("Blog", blogSchema);
