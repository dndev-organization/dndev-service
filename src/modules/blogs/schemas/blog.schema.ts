import { Schema, Types } from 'mongoose';

export const BlogSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, default: 'Anonymous' },
   categories: [
      { type: Types.ObjectId, ref: 'Category' } 
    ],
  isDeleted: { type: Boolean, default: false}
}, {
  timestamps: true,
});
