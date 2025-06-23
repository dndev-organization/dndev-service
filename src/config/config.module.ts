import { Module } from '@nestjs/common';
import { multerConfig } from './multer.config';

@Module({
  imports: [multerConfig],
  exports: [multerConfig],
})
export class ConfigModule {}