import { CommentDocument } from '../../modules/comment/schemas/comment.schemas';

export class CommentMapper {
  static toResponse(comment: CommentDocument): any {
    return {
      id: comment._id.toString(),
      blogId: comment.blog?._id?.toString() ?? comment.blog?.toString(),
      userName: comment.userName,
      content: comment.content,
      parentCommentId:
        comment.parentComment?._id?.toString() ??
        comment.parentComment?.toString() ??
        null,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
