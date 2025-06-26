import { IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class BaseCommentDto {
  @IsOptional()
  blog?: Types.ObjectId;

  @IsOptional()
  @IsString()
  userName?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  parentComment?: Types.ObjectId;
}
