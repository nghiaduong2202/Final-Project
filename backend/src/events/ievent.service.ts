import { UUID } from 'crypto';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { Event } from './entities/event.entity';
import { RegisterEventDto } from './dtos/register-event.dto';
import { ParticipantDto } from './dtos/participant.dto';
import { EventParticipantStatusEnum } from './enums/event-participant-status.enum';

export interface IEventService {
  create(
    createEventDto: CreateEventDto,
    ownerId: UUID,
  ): Promise<{ message: string }>;

  update(
    updateEventDto: UpdateEventDto,
    ownerId: UUID,
  ): Promise<{ message: string }>;

  getMany(): Promise<Event[]>;

  getByOnwer(ownerId: UUID): Promise<Event[]>;

  getMyRegister(playerId: UUID): Promise<Event[]>;

  getDetail(eventId: UUID): Promise<Event>;

  register(
    registerEventDto: RegisterEventDto,
    playerId: UUID,
  ): Promise<{ message: string }>;

  decideRegister(
    participantDto: ParticipantDto,
    ownerId: UUID,
    status: EventParticipantStatusEnum,
  ): Promise<{ message: string }>;
}
