import mongoose, { Schema, model } from "mongoose";
import { TProduct } from "./products.interface";


const productSchema = new Schema<TProduct>(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    minStockThreshold: {
      type: Number,
      required: true,
      default: 5,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "OUT_OF_STOCK"],
      default: "ACTIVE",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = model<TProduct>("Product", productSchema);

export default Product;
