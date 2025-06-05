import { Document, Types } from 'mongoose';
import { Category } from './category.interface';

export interface Blog extends Document {
  title: string;
  content: string;
  author?: string;
  categories: (Types.ObjectId | Category)[];
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
