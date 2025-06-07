import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateDraftBookingDto } from './dtos/requests/create-draft-booking.dto';
import { ActivePerson } from 'src/auths/decorators/active-person.decorator';
import { UUID } from 'crypto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';
import { UpdateBookingSlotDto } from './dtos/requests/update-booking-slot.dto';
import { UpdateAdditionalServicesDto } from './dtos/requests/update-additional-services.dto';
import { GetScheduleDto } from './dtos/requests/get-schedule.dto';
import { CreateDraftBookingByOwnerDto } from './dtos/requests/create-draft-booking-by-owner.dto';

@Controller('booking')
export class BookingController {
  constructor(
    /**
     * inject BookingService
     */
    private readonly bookingService: BookingService,
  ) {}

  @ApiOperation({
    summary: 'create draft booking (role: palyer)',
  })
  @Post('create-draft')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public createDraft(
    @Body() createDraftBookingDto: CreateDraftBookingDto,
    @ActivePerson('sub') playerId: UUID,
  ) {
    return this.bookingService.createDraft(createDraftBookingDto, playerId);
  }

  @ApiOperation({
    summary: 'update fields (roles: player)',
  })
  @Put(':bookingId/update-booking-slot')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public updateBookingSlot(
    @Param('bookingId', ParseUUIDPipe) bookingId: UUID,
    @Body() updateBookingSlotDto: UpdateBookingSlotDto,
    @ActivePerson('sub') playerId: UUID,
  ) {
    return this.bookingService.updateBookingSlot(
      bookingId,
      updateBookingSlotDto,
      playerId,
    );
  }

  @ApiOperation({
    summary: 'update additional service (roles: player)',
  })
  @Put(':bookingId/update-additional-services')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public updateService(
    @Param('bookingId', ParseUUIDPipe) bookingId: UUID,
    @Body() updateAdditionServices: UpdateAdditionalServicesDto,
    @ActivePerson('sub') playerId: UUID,
  ) {
    return this.bookingService.updateAdditionalServices(
      bookingId,
      updateAdditionServices,
      playerId,
    );
  }

  @ApiOperation({
    summary: 'get all booking of player (role: player)',
  })
  @Get('player')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public getManyByPlayer(@ActivePerson('sub') playerId: UUID) {
    return this.bookingService.getManyByPlayer(playerId);
  }

  @ApiOperation({
    summary: 'get all booking of owner (role: owner)',
  })
  @ApiQuery({
    name: 'facility',
    type: 'string',
  })
  @Get('owner')
  @AuthRoles(AuthRoleEnum.OWNER)
  public getManyByOwner(
    @ActivePerson('sub') ownerId: UUID,
    @Query(
      'facility',
      new ParseUUIDPipe({
        optional: true,
      }),
    )
    facilityId?: UUID,
  ) {
    return this.bookingService.getManyByOwner(ownerId, facilityId);
  }

  @ApiOperation({
    summary: 'delete draft booking (role: player)',
  })
  @Delete(':bookingId/delete-draft')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public deleteDraftBooking(
    @Param('bookingId', ParseUUIDPipe) booingId: UUID,
    @ActivePerson('sub') playerId: UUID,
  ) {
    return this.bookingService.deleteDraft(booingId, playerId);
  }

  @ApiOperation({
    summary: 'get detail booking (role: none)',
  })
  @Get(':bookingId/detail')
  @AuthRoles(AuthRoleEnum.NONE)
  public getDetail(@Param('bookingId', ParseUUIDPipe) bookingId: UUID) {
    return this.bookingService.getDetail(bookingId);
  }

  @ApiOperation({
    summary: 'get bookings to display schedule (role: owner)',
  })
  @Get('schedule')
  @AuthRoles(AuthRoleEnum.OWNER)
  public getSchedule(
    @Query() getScheduleDto: GetScheduleDto,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.bookingService.getSchedule(getScheduleDto, ownerId);
  }

  @ApiOperation({
    summary: 'cancel booking (role: player)',
  })
  @Put(':bookingId/cancel')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public cancelBooking(
    @Param('bookingId', ParseUUIDPipe) bookingId: UUID,
    @ActivePerson('sub') playerId: UUID,
  ) {
    return this.bookingService.cancelBooking(bookingId, playerId);
  }

  @ApiOperation({
    summary: 'create draft booking by owner (role: owner)',
  })
  @Post('create-draft-owner')
  @AuthRoles(AuthRoleEnum.OWNER)
  public createDraftByOwner(
    @Body() createDraftBookingByOnwerDto: CreateDraftBookingByOwnerDto,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.bookingService.createDraftByOwner(
      createDraftBookingByOnwerDto,
      ownerId,
    );
  }

  @ApiOperation({
    summary: 'update addition services by owner (role: owner)',
  })
  @Put(':bookingId/update-additional-services-by-owner')
  @AuthRoles(AuthRoleEnum.OWNER)
  public updateAdditionalServicesByOwner(
    @Param('bookingId', ParseUUIDPipe) bookingId: UUID,
    @Body() updateAdditionalServiceDto: UpdateAdditionalServicesDto,
  ) {
    return this.bookingService.updateAdditionalServices(
      bookingId,
      updateAdditionalServiceDto,
    );
  }
}
