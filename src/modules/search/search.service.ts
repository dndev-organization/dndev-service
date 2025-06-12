import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog } from '../../interfaces/blog.interface';

@Injectable()
export class SearchService {
  constructor(@InjectModel('Blog') private blogModel: Model<Blog>) {}

  async searchBlogs(
    query: string,
    categoryId?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    blogs: Blog[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const skip = (page - 1) * limit; 

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

      const countPipeline = [...searchPipeline, { $count: 'total' }];

      searchPipeline.push(
        {
          $sort: {
            score: { $meta: 'textScore' },
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      );

      const [blogs, countResult] = await Promise.all([
        this.blogModel.aggregate(searchPipeline).exec(),
        this.blogModel.aggregate(countPipeline).exec(),
      ]);

      const total = countResult.length > 0 ? countResult[0].total : 0;
      const totalPages = Math.ceil(total / limit);

      return {
        blogs,
        total,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search blogs');
    }
  }
}