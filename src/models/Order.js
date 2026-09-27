import mongoose from "mongoose";
import objectField from "../utils/commonFields/objectField.js";
import numberField from "../utils/commonFields/numberField.js";
import enumField from "../utils/commonFields/enumField.js";

const OrderSchema = mongoose.Schema(
  {
    //     { user: ObjectId, items: [{ product: ObjectId, quantity: Number, price: Number }], totalAmount: Number,
    // status: 'pending'|'confirmed'|'shipped'|'delivered'|'cancelled', createdAt }
    user: objectField({ ref: "User", required: true }),
    items: [
      {
        product: objectField({ ref: "Product", required: true }),
        quantity: numberField({ required: true, min: 1 }),
        price: numberField({ required: true, min: 0 }),
      },
    ],
    totalAmount: numberField({ required: true }),
    status: enumField({
      values: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      defaultValue: "pending",
    }),
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Order", OrderSchema);
