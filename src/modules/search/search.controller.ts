import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Blog } from '../../interfaces/blog.interface';

@Controller('/api/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') query: string,
    @Query('category') categoryId?: string,
  ): Promise<Blog[]> {
    if (!query) {
      return [];
    }
    return this.searchService.searchBlogs(query, categoryId);
  }
}