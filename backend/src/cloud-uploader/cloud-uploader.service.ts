import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryProvider } from './providers/cloudinary.provider';

@Injectable()
export class CloudUploaderService {
  constructor(
    /**
     * inject CloudinaryProvider
     */
    private readonly cloudinaryProvider: CloudinaryProvider,
  ) {}

  public async upload(file: Express.Multer.File) {
    return await this.cloudinaryProvider.upload(file);
  }

  public async uploadImage(file: Express.Multer.File) {
    const mimetype = file.mimetype;

    if (!mimetype.includes('image')) {
      throw new BadRequestException('This file not image');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { secure_url } = await this.cloudinaryProvider.upload(file);

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      url: secure_url,
    };
  }
}
