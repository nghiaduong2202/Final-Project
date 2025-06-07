import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { EventService } from './event.service';
import { ApiOperation } from '@nestjs/swagger';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';
import { CreateEventDto } from './dtos/create-event.dto';
import { ActivePerson } from 'src/auths/decorators/active-person.decorator';
import { UUID } from 'crypto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { RegisterEventDto } from './dtos/register-event.dto';
import { ParticipantDto } from './dtos/participant.dto';
import { EventParticipantStatusEnum } from './enums/event-participant-status.enum';

@Controller('event')
export class EventController {
  constructor(
    /**
     * inject EventService
     */
    private readonly eventService: EventService,
  ) {}

  @ApiOperation({
    summary: 'create event (role: owner)',
  })
  @Post()
  @AuthRoles(AuthRoleEnum.OWNER)
  public create(
    @Body() createEventDto: CreateEventDto,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.eventService.create(createEventDto, ownerId);
  }

  @ApiOperation({
    summary: 'update event (role: owner)',
  })
  @Put()
  @AuthRoles(AuthRoleEnum.OWNER)
  public update(
    @Body() updateEventDto: UpdateEventDto,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.eventService.update(updateEventDto, ownerId);
  }

  @ApiOperation({
    summary: 'get many event (role: none)',
  })
  @Get()
  @AuthRoles(AuthRoleEnum.NONE)
  public getMany() {
    return this.eventService.getMany();
  }

  @ApiOperation({
    summary: "get all owner's event (role: owner)",
  })
  @Get('owner')
  @AuthRoles(AuthRoleEnum.OWNER)
  public getByOwner(@ActivePerson('sub') ownerId: UUID) {
    return this.eventService.getByOnwer(ownerId);
  }

  @ApiOperation({
    summary: 'player get all registered event (role: player)',
  })
  @Get('my-register')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public getMyRegister(@ActivePerson('sub') playerId: UUID) {
    return this.eventService.getMyRegister(playerId);
  }

  @ApiOperation({
    summary: 'get detail of event (role: none)',
  })
  @Get(':eventId')
  @AuthRoles(AuthRoleEnum.NONE)
  public getDetail(@Param('eventId', ParseUUIDPipe) eventId: UUID) {
    return this.eventService.getDetail(eventId);
  }

  @ApiOperation({
    summary: 'register a event (role: player)',
  })
  @Post('register')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public register(
    @Body() registerEventDto: RegisterEventDto,
    @ActivePerson('sub') playerId: UUID,
  ) {
    return this.eventService.register(registerEventDto, playerId);
  }

  @ApiOperation({
    summary: 'accept registered event (role: owner)',
  })
  @Put('accept')
  @AuthRoles(AuthRoleEnum.OWNER)
  public accept(
    @Body() participantDto: ParticipantDto,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.eventService.decideRegister(
      participantDto,
      ownerId,
      EventParticipantStatusEnum.ACCEPTED,
    );
  }

  @ApiOperation({
    summary: 'reject registered event (role: owner)',
  })
  @Put('reject')
  @AuthRoles(AuthRoleEnum.OWNER)
  public reject(
    @Body() participantDto: ParticipantDto,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.eventService.decideRegister(
      participantDto,
      ownerId,
      EventParticipantStatusEnum.REJECTED,
    );
  }
}
