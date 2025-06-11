import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog } from '../../interfaces/blog.interface';

@Injectable()
export class SearchService {
  constructor(@InjectModel('Blog') private blogModel: Model<Blog>) {}

  async searchBlogs(query: string, categoryId?: string): Promise<Blog[]> {
    const searchPipeline: any[] = [
      {
        $match: {
          $text: { $search: query }, 
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categories',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
    ];

    if (categoryId) {
      searchPipeline.push({
        $match: {
          categories: { $in: [categoryId] },
        },
      });
    }

    searchPipeline.push(
      {
        $limit: 20,
      },
      {
        $sort: {
          score: { $meta: 'textScore' }, 
        },
      },
    );

    return this.blogModel.aggregate(searchPipeline).exec();
  }
}