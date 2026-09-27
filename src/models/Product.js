import mongoose from "mongoose";
import stringField from "../utils/commonFields/stringField.js";
import numberField from "../utils/commonFields/numberField.js";
import booleanField from "../utils/commonFields/booleanField.js";

const ProductSchema = mongoose.Schema(
  {
    // { name, category, price, stock, isActive, createdAt
    name: stringField({ required: true }),
    category: stringField({ required: true, index: true }),
    price: numberField({ required: true, min: 0 }),
    stock: numberField({ required: true, min: 0 }),
    isActive: booleanField({ required: true, defaultValue: true }),
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

ProductSchema.index({ category: 1, price: 1 });

export default mongoose.model("Product", ProductSchema);
