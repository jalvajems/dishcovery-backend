import  { model, Schema } from 'mongoose';

const foodieSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true,
    },
    phone:{type:String,trim:true},
    location:{type:String,required:true},
    preferences:{type:String,trim:true},
    bio: {type: String,trim: true},
    image: {type: String},
    status: {type: String,enum: ["active", "blocked"],default: "active"},
  },
  { timestamps: true }
);

export default model("Foodie",foodieSchema)
