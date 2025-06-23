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
    return this.blogModel.find().sort({ createdAt: -1 }).populate('categories').exec();
  }

  async findOne(id: string): Promise<Blog> {
    const blog = await this.blogModel.findById(id).populate('categories').exec();
    if (!blog) throw new NotFoundException('Blog không được tìm thấy');
    return blog;
  }

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    const newBlog = new this.blogModel(createBlogDto);
    return newBlog.save();
  }

  async update(id: string, updateDto: UpdateBlogDto): Promise<Blog> {
    const updated = await this.blogModel.findByIdAndUpdate(id, updateDto, { new: true }).populate('categories').exec();
    if (!updated) throw new NotFoundException('Blog không được tìm thấy');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const result = await this.blogModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Blog không được tìm thấy');
  }

  async uploadImage(id: string, imagePath: string): Promise<Blog> {
    const blog = await this.blogModel.findById(id);
    if (!blog) throw new NotFoundException('Blog không được tìm thấy');
    blog.image = imagePath; // Cập nhật đường dẫn hình ảnh
    return blog.save();
  }
}