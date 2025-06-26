import { IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { BaseCommentDto } from './comment.dto';

export class CreateCommentDto extends BaseCommentDto {
  @IsNotEmpty()
  @Type(() => Types.ObjectId)
  declare blog: Types.ObjectId;

  @IsNotEmpty()
  declare userName: string;

  @IsNotEmpty()
  declare content: string;

  @IsOptional()
  @Type(() => Types.ObjectId)
  declare parentComment?: Types.ObjectId;
}
