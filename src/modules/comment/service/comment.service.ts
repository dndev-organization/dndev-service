import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from '../schemas/comment.schemas';
import { CommentMapper } from '../../../common/utils/comment.mapper';
import { CreateCommentDto } from '../dto/createComment.dto';
import { UpdateCommentDto } from '../dto/updateComment.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<Comment>,
  ) {}

  async showCommentsWithBlog(blogId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ blog: blogId })
      .populate('blog')
      .sort({ createdAt: -1 })
      .exec();
  }

  async createComment(dto: CreateCommentDto): Promise<any> {
    const created = await this.commentModel.create(dto);
    return CommentMapper.toResponse(created);
  }

  async updateComment(id: string, dto: UpdateCommentDto): Promise<any> {
    const updated = await this.commentModel
      .findByIdAndUpdate(id, dto, {
        new: true,
        runValidators: true,
      })
      .populate('blog')
      .exec();

    if (!updated) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return CommentMapper.toResponse(updated);
  }

  async deleteComment(id: string): Promise<{ message: string }> {
    const deleted = await this.commentModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return { message: `Comment with id ${id} has been deleted` };
  }
}
