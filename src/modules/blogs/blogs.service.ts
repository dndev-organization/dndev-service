import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog } from '../../interfaces/blog.interface';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(@InjectModel('Blog') private readonly blogModel: Model<Blog>) {}

  async findAll(): Promise<Blog[]> {
    return this.blogModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<Blog> {
    const blog = await this.blogModel.findById(id);
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    const newBlog = new this.blogModel(createBlogDto);
    return newBlog.save();
  }

  async update(id: string, updateDto: UpdateBlogDto): Promise<Blog> {
    const updated = await this.blogModel.findByIdAndUpdate(id, updateDto, { new: true });
    if (!updated) throw new NotFoundException('Blog not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.blogModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Blog not found');
  }
}
