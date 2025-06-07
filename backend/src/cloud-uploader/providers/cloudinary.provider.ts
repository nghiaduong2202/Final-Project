import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary-response.type';
import { v2 as cloudinary } from 'cloudinary';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-require-imports
const streamifier = require('streamifier');

@Injectable()
export class CloudinaryProvider {
  public upload(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          if (error) return reject(error);
          resolve(result!);
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
