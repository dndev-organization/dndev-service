import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { BlogsModule } from './modules/blogs/blogs.module';
import { UsersModule } from './modules/users/users.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI ?? (() => { throw new Error('MONGO_URI is not defined'); })()
    ),
     ConfigModule.forRoot({
      isGlobal: true, 
    }),
    BlogsModule,
    UsersModule,
  ],
})
export class AppModule {}
