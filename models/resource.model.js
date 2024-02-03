import mongoose from "mongoose";

const resourcesSchema = mongoose.Schema({
  name: { type: String, required: true },
  count: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  priceUpgrade: { type: Number, default: 0},
  user: { type: mongoose.SchemaTypes.ObjectId, ref: "User", required: true },
});

export const Resources = mongoose.model("Resources", resourcesSchema);
