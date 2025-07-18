import {
  Body,
  Delete,
  Controller,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CommentService } from '../service/comment.service';
import { Comment } from '../schemas/comment.schemas';
import { CreateCommentDto } from '../dto/createComment.dto';
import { UpdateCommentDto } from '../dto/updateComment.dto';

@Controller('/api/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('blog/:blogId')
  async getCommentsByBlog(@Param('blogId') blogId: string): Promise<Comment[]> {
    return this.commentService.showCommentsWithBlog(blogId);
  }

  @Post()
  async create(@Body() dto: CreateCommentDto): Promise<any> {
    return this.commentService.createComment(dto);
  }

  @Put(':id')
  async updateComment(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<any> {
    return this.commentService.updateComment(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.commentService.deleteComment(id);
  }
}
