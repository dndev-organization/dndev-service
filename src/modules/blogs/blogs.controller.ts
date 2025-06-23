import { Controller, Get, Post, Body, Param, Put, Delete, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseGuards } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JWTconstants } from 'src/constants/jwt.constants';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/api/blogs')
export class BlogsController {
  constructor(private readonly blogService: BlogsService) {}

  @Get()
  getAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  @UseGuards(AuthGuard(JWTconstants.jwt), RolesGuard)
  @Roles(1)
  @Post('posts')
  create(@Body() dto: CreateBlogDto) {
    return this.blogService.create(dto);
  }

  @UseGuards(AuthGuard(JWTconstants.jwt), RolesGuard)
  @Roles(1)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    return this.blogService.update(id, dto);
  }

  @UseGuards(AuthGuard(JWTconstants.jwt), RolesGuard)
  @Roles(1)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.blogService.delete(id);
  }

  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    return this.blogService.uploadImage(id, file.filename);
  }
}