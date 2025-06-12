import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { SearchService } from './search.service';
import { Blog } from '../../interfaces/blog.interface';

@Controller('/api/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') query: string,
    @Query('category') categoryId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<{
    blogs: Blog[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      if (!query) {
        throw new HttpException('Query is required', HttpStatus.BAD_REQUEST);
      }
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      return await this.searchService.searchBlogs(query, categoryId, pageNum, limitNum);
    } catch (error) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}