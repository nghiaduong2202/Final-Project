import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { SportService } from './sport.service';
import { CreateSportDto } from './dtos/requests/create-sport.dto';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';
import { ApiOperation } from '@nestjs/swagger';
import { UUID } from 'crypto';

@Controller('sport')
export class SportController {
  constructor(
    /**
     * inject SportService
     */
    private readonly sportService: SportService,
  ) {}

  @ApiOperation({
    summary: 'create sport (role: admin)',
  })
  @Post()
  @AuthRoles(AuthRoleEnum.ADMIN)
  public create(@Body() createSportDto: CreateSportDto) {
    return this.sportService.create(createSportDto);
  }

  @ApiOperation({
    summary: 'get all sport (role: none)',
  })
  @Get('all')
  @AuthRoles(AuthRoleEnum.NONE)
  public getAll() {
    return this.sportService.getAll();
  }

  @ApiOperation({
    summary: 'get all sports in facility (role: none)',
  })
  @Get(':facilityId/all-sports')
  @AuthRoles(AuthRoleEnum.NONE)
  public getAllSportsByFacility(
    @Param('facilityId', ParseUUIDPipe) facilityId: UUID,
  ) {
    return this.sportService.getManyByFacility(facilityId);
  }
}
