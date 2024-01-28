import mongoose from "mongoose";

const resourcesSchema = mongoose.Schema({
  name: { type: String, required: true },
  count: { type: Number, default: 0 },
});

export const Resources = mongoose.model("Resources", resourcesSchema);
