import mongoose, { Schema, model } from 'mongoose';
import { TProductCategory } from './productCategory.interface';

const productCategorySchema = new Schema<TProductCategory>(
  {
    categoryName: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      default: '#6366f1',
      match: [
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        'Please provide a valid hex color',
      ],
    },
    icon: {
      type: String,
      required: [true, 'Icon is required'],
      default: '📦',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const ProductCategory = model<TProductCategory>(
  'ProductCategory',
  productCategorySchema,
);

export default ProductCategory;
