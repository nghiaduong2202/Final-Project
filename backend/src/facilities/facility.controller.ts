import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FacilityService } from './facility.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { CreateFacilityInterceptor } from './interceptors/create-facility.interceptor';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';
import { CreateFacilityDto } from './dtos/requests/create-facility.dto';
import { SportLicensesDto } from './dtos/requests/sport-licenses.dto';
import { ActivePerson } from 'src/auths/decorators/active-person.decorator';
import { UUID } from 'crypto';
import { DeleteImageDto } from './dtos/requests/delete-image.dto';
import { UpdateBaseInfo } from './dtos/requests/update-base-info.dto';

@Controller('facility')
export class FacilityController {
  constructor(
    /**
     * inject FacilityService
     */
    private readonly facilityService: FacilityService,
  ) {}

  @ApiOperation({
    summary: 'create new facility and field groups and fields (role: owner)',
  })
  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 10 },
      { name: 'licenses', maxCount: 7 },
      { name: 'certificate', maxCount: 1 },
    ]),
    CreateFacilityInterceptor,
  )
  @AuthRoles(AuthRoleEnum.OWNER)
  public create(
    @Body('facilityInfo') createFacilityDto: CreateFacilityDto,
    @UploadedFiles()
    files: {
      images: Express.Multer.File[];
      certificate: Express.Multer.File[];
      licenses?: Express.Multer.File[];
    },
    @Body('sportLicenses') sportLicensesDto: SportLicensesDto,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.facilityService.create(
      createFacilityDto,
      files.images,
      ownerId,
      files.certificate[0],
      files.licenses,
      sportLicensesDto.sportIds,
    );
  }

  @ApiOperation({
    summary: 'get all facilities (role: none)',
  })
  @Get('all')
  @AuthRoles(AuthRoleEnum.NONE)
  public getAll() {
    return this.facilityService.getAll();
  }

  @ApiOperation({
    summary: 'get favorite facility by player (role: player)',
  })
  @Get('/favorite')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public getFavorite(@ActivePerson('sub') playerId: UUID) {
    return this.facilityService.getFavorite(playerId);
  }

  @ApiOperation({
    summary: 'get drop down info of facility (role: owner)',
  })
  @Get('drop-down')
  @AuthRoles(AuthRoleEnum.OWNER)
  public getDropDownInfo(@ActivePerson('sub') ownerId: UUID) {
    return this.facilityService.getDropDownInfo(ownerId);
  }

  @ApiOperation({
    summary: 'get all facility by owner (role: none)',
  })
  @Get('owner/:ownerId')
  @AuthRoles(AuthRoleEnum.NONE)
  public getByOwner(@Param('ownerId', ParseUUIDPipe) ownerId: UUID) {
    return this.facilityService.getByOwner(ownerId);
  }

  @ApiOperation({
    summary: 'get all existing name of owner (role: onwer)',
  })
  @Get('existing-name')
  @AuthRoles(AuthRoleEnum.OWNER)
  public getExistingFacilityName(@ActivePerson('sub') ownerId: UUID) {
    return this.facilityService.getExistingFacilityName(ownerId);
  }

  @ApiOperation({
    summary: 'get top rated facility (role: none)',
  })
  @Get('top-facility')
  @AuthRoles(AuthRoleEnum.NONE)
  public getTopFacility() {
    return this.facilityService.getTopFacilities();
  }

  @ApiOperation({
    summary: 'get facility by id (role: none)',
  })
  @Get(':facilityId')
  @AuthRoles(AuthRoleEnum.NONE)
  public getByFacility(@Param('facilityId', ParseUUIDPipe) facilityId: UUID) {
    return this.facilityService.getByFacility(facilityId);
  }

  @ApiOperation({
    summary: 'update name of facility (role: owner)',
  })
  @ApiQuery({
    name: 'name',
    type: 'string',
    example: 'Tên cơ sở mới',
  })
  @UseInterceptors(FileInterceptor('certificate'))
  @Put(':facilityId/update-name')
  @AuthRoles(AuthRoleEnum.OWNER)
  public updateName(
    @Param('facilityId', ParseUUIDPipe) facilityId: UUID,
    @Query('name') name: string,
    @UploadedFile() certificate: Express.Multer.File,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.facilityService.updateName(
      facilityId,
      name,
      certificate,
      ownerId,
    );
  }

  @ApiOperation({
    summary: 'update certificate in facility (role: owner)',
  })
  @UseInterceptors(FileInterceptor('certificate'))
  @Put(':facilityId/update-certificate')
  @AuthRoles(AuthRoleEnum.OWNER)
  public updateCertificate(
    @Param('facilityId', ParseUUIDPipe) facilityId: UUID,
    @UploadedFile() certificate: Express.Multer.File,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.facilityService.updateCertificate(
      facilityId,
      certificate,
      ownerId,
    );
  }

  @ApiOperation({
    summary: 'update license inn facility (role: owner)',
  })
  @ApiQuery({
    name: 'sportId',
    type: 'number',
    example: 1,
  })
  @UseInterceptors(FileInterceptor('license'))
  @Put(':facilityId/update-license')
  @AuthRoles(AuthRoleEnum.OWNER)
  public updateLicense(
    @Param('facilityId', ParseUUIDPipe) facilityId: UUID,
    @Query('sportId', ParseIntPipe) sportId: number,
    @UploadedFile() license: Express.Multer.File,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.facilityService.updateLicense(
      facilityId,
      sportId,
      license,
      ownerId,
    );
  }

  @ApiOperation({
    summary: 'add many image into facility (role: owner)',
  })
  @UseInterceptors(FilesInterceptor('images'))
  @Put(':facilityId/add-images')
  @AuthRoles(AuthRoleEnum.OWNER)
  addImages(
    @Param('facilityId', ParseUUIDPipe) facilityId: UUID,
    @UploadedFiles() images: Express.Multer.File[],
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.facilityService.addImages(facilityId, images, ownerId);
  }

  @ApiOperation({
    summary: 'delete the image (role: owner)',
  })
  @Delete('delete-image')
  @AuthRoles(AuthRoleEnum.OWNER)
  deleteImage(
    @Body() deleteImageDto: DeleteImageDto,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.facilityService.deleteImage(deleteImageDto, ownerId);
  }

  @ApiOperation({
    summary: 'update base information of facility (role: owner)',
  })
  @Put(':facilityId/update-info')
  @AuthRoles(AuthRoleEnum.OWNER)
  public updateBaseInfo(
    @Param('facilityId', ParseUUIDPipe) facilityId: UUID,
    @Body() updateBaseInfo: UpdateBaseInfo,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.facilityService.updateBaseInfo(
      facilityId,
      updateBaseInfo,
      ownerId,
    );
  }

  @ApiOperation({
    summary: 'get active time of facility (role: none)',
  })
  @Get(':facilityId/active-time')
  @AuthRoles(AuthRoleEnum.NONE)
  public getActiveTime(@Param('facilityId', ParseUUIDPipe) facilityId: UUID) {
    return this.facilityService.getActiveTime(facilityId);
  }

  @ApiOperation({
    summary: 'add the facility to favorite list (role: player)',
  })
  @Post(':facilityId/favorite')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public AddFavorite(
    @Param('facilityId', ParseUUIDPipe) facilityId: UUID,
    @ActivePerson('sub') playerId: UUID,
  ) {
    return this.facilityService.addFavorite(facilityId, playerId);
  }

  @ApiOperation({
    summary: 'delete the favorite facility (role: player)',
  })
  @Delete(':facilityId/favorite')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public deleteFavorite(
    @Param('facilityId', ParseUUIDPipe) facilityId: UUID,
    @ActivePerson('sub') playerId: UUID,
  ) {
    return this.facilityService.deleteFavorite(facilityId, playerId);
  }
}
