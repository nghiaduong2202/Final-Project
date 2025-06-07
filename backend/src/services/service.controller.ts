import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { ApiOperation } from '@nestjs/swagger';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';
import { CreateManyServicesDto } from './dtos/requests/create-many-services.dto';
import { ActivePerson } from 'src/auths/decorators/active-person.decorator';
import { UUID } from 'crypto';
import { UpdateServiceDto } from './dtos/requests/update-service.dto';

@Controller('service')
export class ServiceController {
  constructor(
    /**
     * inject ServiceService
     */
    private readonly serviceService: ServiceService,
  ) {}

  @ApiOperation({
    summary: 'create many service (role: owner)',
  })
  @Post()
  @AuthRoles(AuthRoleEnum.OWNER)
  public createMany(
    @Body() createManyServicesDto: CreateManyServicesDto,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.serviceService.createMany(createManyServicesDto, ownerId);
  }

  @ApiOperation({
    summary: 'upadte service (role: owner)',
  })
  @Patch(':serviceId')
  @AuthRoles(AuthRoleEnum.OWNER)
  public update(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @Body() updateServiceDto: UpdateServiceDto,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.serviceService.update(updateServiceDto, serviceId, ownerId);
  }

  @ApiOperation({
    summary: 'delete service (role: owner)',
  })
  @Delete(':serviceId')
  @AuthRoles(AuthRoleEnum.OWNER)
  public delete(
    @Param('serviceId', ParseIntPipe) serviceId: number,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.serviceService.delete(serviceId, ownerId);
  }

  @ApiOperation({
    summary: 'Get services by facility (role: none)',
  })
  @Get(':facilityId')
  @AuthRoles(AuthRoleEnum.NONE)
  public getByFacility(@Param('facilityId', ParseUUIDPipe) facilityId: UUID) {
    return this.serviceService.getByFacility(facilityId);
  }

  @ApiOperation({
    summary: 'get available service in facility (role: none)',
  })
  @Post(':facilityId/:bookingId/available-service-in-facility')
  @AuthRoles(AuthRoleEnum.NONE)
  public getAvailableServiceInFacility(
    @Param('facilityId', ParseUUIDPipe) facilityId: UUID,
    @Param('bookingId', ParseUUIDPipe) bookingId: UUID,
  ) {
    return this.serviceService.getAvailableServiceInFacility(
      facilityId,
      bookingId,
    );
  }
}
