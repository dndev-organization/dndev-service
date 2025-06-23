import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';    
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BlogsModule } from './modules/blogs/blogs.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SearchModule } from './modules/search/search.module';
import configuration from './config/configuration';

@Module({
  imports: [
     ConfigModule.forRoot({
       isGlobal: true,
      load: [configuration],
      envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`],
    }),

     MongooseModule.forRootAsync({
      imports: [ConfigModule], 
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongoUri'),
      }),
    }),

    BlogsModule,
    UsersModule,
    CategoriesModule,
    SearchModule,
  ],
})
export class AppModule {}
