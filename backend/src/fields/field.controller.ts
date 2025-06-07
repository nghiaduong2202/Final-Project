import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Put,
} from '@nestjs/common';
import { FieldService } from './field.service';
import { ApiOperation } from '@nestjs/swagger';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';
import { CreateManyFieldsDto } from './dtos/requests/create-many-fields';
import { UUID } from 'crypto';
import { ActivePerson } from 'src/auths/decorators/active-person.decorator';
import { UpdateFieldDto } from './dtos/requests/update-field.dto';

@Controller('field')
export class FieldController {
  constructor(
    /**
     * inject FieldService
     */
    private readonly fieldService: FieldService,
  ) {}

  @ApiOperation({
    summary: 'create many fields (role: owner)',
  })
  @Put(':fieldGroupId')
  @AuthRoles(AuthRoleEnum.OWNER)
  public craeteMany(
    @Body() createManyFieldsDto: CreateManyFieldsDto,
    @Param('fieldGroupId', ParseUUIDPipe) fieldGroupId: UUID,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.fieldService.createMany(
      createManyFieldsDto,
      fieldGroupId,
      ownerId,
    );
  }

  @ApiOperation({
    summary: 'update field (role: owner)',
  })
  @Patch()
  @AuthRoles(AuthRoleEnum.OWNER)
  public update(
    @Body() updateFieldDto: UpdateFieldDto,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.fieldService.update(updateFieldDto, ownerId);
  }

  @ApiOperation({
    summary: 'delete field (role: owner)',
  })
  @Delete(':fieldId')
  @AuthRoles(AuthRoleEnum.OWNER)
  public delete(
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @ActivePerson('sub') ownerID: UUID,
  ) {
    return this.fieldService.delete(fieldId, ownerID);
  }
}
