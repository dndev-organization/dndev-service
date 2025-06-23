import { Schema } from 'mongoose';

export const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: Number, enum: [0, 1], default: 0 },
  refreshToken: { type: String, default: null },   
});
