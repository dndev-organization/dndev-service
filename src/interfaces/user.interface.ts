import { Document } from 'mongoose';

export interface User extends Document {
  email: string;
  password: string;
  role: number;
  refreshToken?: string;
  otp?: string | null;
  otpExpiresAt?: Date | null;
  
}
