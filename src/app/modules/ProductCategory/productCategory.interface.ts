import { Types } from 'mongoose';

export interface TProductCategory {
  categoryName: string;
  color: string;
  icon: string;
  createdBy: Types.ObjectId;
}
