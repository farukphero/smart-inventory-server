import { Types } from 'mongoose';

export type TProductStatus = 'ACTIVE' | 'OUT_OF_STOCK';

export type TProduct = {
  productName: string;
  description: string;
  categoryId: Types.ObjectId;
  price: number;
  stockQuantity: number;
  minStockThreshold: number;
  status: TProductStatus;
  createdBy: Types.ObjectId;
};
