import { Document } from 'mongoose';

export interface Blog extends Document {
  title: string;
  content: string;
  author?: string;
  createdAt: Date;
}
