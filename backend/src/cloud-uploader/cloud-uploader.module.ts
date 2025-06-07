import { Module } from '@nestjs/common';
import { CloudUploaderService } from './cloud-uploader.service';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryProvider } from './providers/cloudinary.provider';
import { CloudUploaderController } from './cloud-uploader.controller';

@Module({
  providers: [
    CloudUploaderService,
    CloudinaryProvider,
    {
      provide: 'CLOUDINARY',
      useFactory: () => {
        return cloudinary.config({
          cloud_name: process.env.CLOUDINARY_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });
      },
    },
  ],
  exports: [CloudUploaderService],
  controllers: [CloudUploaderController],
})
export class CloudUploaderModule {}
