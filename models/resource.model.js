import mongoose from "mongoose";

const resourcesSchema = mongoose.Schema({
  name: { type: String, required: true }, // Название ресурса
  count: { type: Number, default: 0 }, // Количество добываемого ресурса
});

export const Resources = mongoose.model("Resources", resourcesSchema);

