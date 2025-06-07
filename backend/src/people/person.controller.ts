import {
  Body,
  Controller,
  Get,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { UUID } from 'crypto';
import { ActivePerson } from 'src/auths/decorators/active-person.decorator';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';
import { PersonService } from './person.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdatePersonDto } from './dtos/requests/update-person.dto';
@Controller('person')
export class PersonController {
  constructor(
    /**
     * inject PersonService
     */
    private readonly personService: PersonService,
  ) {}

  @ApiOperation({
    summary: 'get all person (role: admin)',
  })
  @Get('all')
  @AuthRoles(AuthRoleEnum.ADMIN)
  public getAll() {
    return {
      message: 'Hello admin',
    };
  }

  @ApiOperation({
    summary: 'Get my information (role: admin, owner, player)',
  })
  @Get('my-info')
  @AuthRoles(AuthRoleEnum.ADMIN, AuthRoleEnum.OWNER, AuthRoleEnum.PLAYER)
  public getMyInfor(@ActivePerson('sub') personId: UUID) {
    return this.personService.findOneById(personId);
  }

  @ApiOperation({
    summary: 'update avata (role: admin, owner, player)',
  })
  @Put('update-avatar')
  @AuthRoles(AuthRoleEnum.ADMIN, AuthRoleEnum.OWNER, AuthRoleEnum.PLAYER)
  @UseInterceptors(FileInterceptor('image'))
  public updateAvata(
    @UploadedFile() image: Express.Multer.File,
    @ActivePerson('sub') personId: UUID,
  ) {
    return this.personService.updateAvatatar(image, personId);
  }

  @ApiOperation({
    summary: 'update info (role: admin, owner, player)',
  })
  @Put('update-infor')
  @AuthRoles(AuthRoleEnum.ADMIN, AuthRoleEnum.OWNER, AuthRoleEnum.PLAYER)
  public updateInfo(
    @Body() updatePersonDto: UpdatePersonDto,
    @ActivePerson('sub') personId: UUID,
  ) {
    return this.personService.updateInfo(updatePersonDto, personId);
  }
}
