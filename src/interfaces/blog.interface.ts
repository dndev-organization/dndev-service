import { Document, Types } from 'mongoose';
import { Category } from './category.interface';

export interface Blog extends Document {
  title: string;
  content: string;
  image?: string;
  author?: string;
  view?: number;
  categories: (Types.ObjectId | Category)[];
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
