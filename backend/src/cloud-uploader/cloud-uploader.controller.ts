import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CloudUploaderService } from './cloud-uploader.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';

@Controller('cloud-uploader')
export class CloudUploaderController {
  constructor(
    /**
     * inject CloudUploaderService
     */
    private readonly cloudUploaderService: CloudUploaderService,
  ) {}

  @Post()
  @AuthRoles(AuthRoleEnum.NONE)
  @UseInterceptors(FileInterceptor('image'))
  @AuthRoles(AuthRoleEnum.ADMIN, AuthRoleEnum.OWNER, AuthRoleEnum.PLAYER)
  public upload(@UploadedFile() image: Express.Multer.File) {
    return this.cloudUploaderService.uploadImage(image);
  }
}
