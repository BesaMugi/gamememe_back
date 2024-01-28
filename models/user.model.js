import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    wallet: {type: Number, required: true, default: 0 },
    inventory: {type: Object, required: true, default: {} },
    hp: {type: Number, required: true, default: 100 },
    energy: {type: Number, required: true, default: 100 }
});

export const User = mongoose.model("User", userSchema);
