import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IEventService } from './ievent.service';
import { UUID } from 'crypto';
import { CreateEventDto } from './dtos/create-event.dto';
import { DataSource, Repository } from 'typeorm';
import { FacilityService } from 'src/facilities/facility.service';
import { SportService } from 'src/sports/sport.service';
import { Event } from './entities/event.entity';
import { Prize } from './entities/prize.entity';
import { UpdateEventDto } from './dtos/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterEventDto } from './dtos/register-event.dto';
import { EventParticipantStatusEnum } from './enums/event-participant-status.enum';
import { EventParticipant } from './entities/event-participant.entity';
import { ParticipantDto } from './dtos/participant.dto';

@Injectable()
export class EventService implements IEventService {
  constructor(
    /**
     * inject DataSource
     */
    private readonly dataSource: DataSource,
    /**
     * inject FacilityService
     */
    private readonly facilityService: FacilityService,
    /**
     * inject SportService
     */
    private readonly sportService: SportService,
    /**
     * inject EventRepository
     */
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    /**
     * inject EventParticipantRepository
     */
    @InjectRepository(EventParticipant)
    private readonly eventParticipantRepository: Repository<EventParticipant>,
  ) {}

  public async create(
    createEventDto: CreateEventDto,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    const facility = await this.facilityService.findOneByIdAndOwnerId(
      createEventDto.facilityId,
      ownerId,
    );

    const sport = await this.sportService.findOneById(createEventDto.sportId);

    await this.dataSource.transaction(async (manager) => {
      const event = manager.create(Event, {
        ...createEventDto,
        facility,
        sport,
      });

      await manager.save(event);

      if (createEventDto.prizeDtos) {
        for (const prize of createEventDto.prizeDtos) {
          const newPrize = manager.create(Prize, {
            ...prize,
            event,
          });

          await manager.save(newPrize);
        }
      }
    });

    return { message: 'Create event successful' };
  }

  public async update(
    updateEventDto: UpdateEventDto,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    const event = await this.eventRepository
      .findOneOrFail({
        relations: {
          prizes: true,
        },
        where: {
          id: updateEventDto.eventId,
          facility: {
            owner: {
              id: ownerId,
            },
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the event');
      });

    await this.dataSource.transaction(async (manager) => {
      if (updateEventDto.name) event.name = updateEventDto.name;

      if (updateEventDto.description)
        event.description = updateEventDto.description;

      if (updateEventDto.facilityId) {
        const newFacility =
          await this.facilityService.findOneByIdAndOwnerWithTransaction(
            updateEventDto.facilityId,
            manager,
            ownerId,
          );

        event.facility = newFacility;
      }

      if (updateEventDto.images) event.images = updateEventDto.images;

      if (updateEventDto.bannerImage)
        event.bannerImage = updateEventDto.bannerImage;

      if (updateEventDto.sportId) {
        const newSport = await this.sportService.findOneByIdWithTransaction(
          updateEventDto.sportId,
          manager,
        );

        event.sport = newSport;
      }

      if (updateEventDto.numberOfParticipant)
        event.numberOfParticipant = updateEventDto.numberOfParticipant;

      if (updateEventDto.isGroup) event.isGroup = updateEventDto.isGroup;

      if (updateEventDto.startDate) event.startDate = updateEventDto.startDate;

      if (updateEventDto.endDate) event.endDate = updateEventDto.endDate;

      if (updateEventDto.endRegisterDate)
        event.endRegisterDate = updateEventDto.endRegisterDate;

      if (updateEventDto.tournamentFormat)
        event.tournamentFormat = updateEventDto.tournamentFormat;

      if (updateEventDto.tournamentFormatDescription)
        event.tournamentFormatDescription =
          updateEventDto.tournamentFormatDescription;

      if (updateEventDto.rule) event.rule = updateEventDto.rule;

      if (updateEventDto.totalPrize)
        event.totalPrize = updateEventDto.totalPrize;

      if (updateEventDto.descriptionPrize)
        event.descriptionPrize = updateEventDto.descriptionPrize;

      if (updateEventDto.isFree) event.isFree = updateEventDto.isFree;

      if (updateEventDto.totalPayment)
        event.totalPayment = updateEventDto.totalPayment;

      if (updateEventDto.desciptionPayment)
        event.desciptionPayment = updateEventDto.desciptionPayment;

      if (updateEventDto.prizeDtos) {
        for (const prize of event.prizes) {
          await manager.remove(prize);
        }

        event.prizes = [];

        for (const prizeDto of updateEventDto.prizeDtos) {
          const newPrize = manager.create(Prize, {
            ...prizeDto,
            event,
          });

          await manager.save(newPrize);
        }
      }

      await manager.save(event);
    });

    return {
      message: 'Update event successful',
    };
  }

  public async getMany(): Promise<Event[]> {
    return await this.eventRepository.find({
      relations: {
        facility: true,
        prizes: true,
        sport: true,
        participants: {
          player: true,
        },
      },
    });
  }

  public async getByOnwer(ownerId: UUID): Promise<Event[]> {
    return await this.eventRepository.find({
      relations: {
        facility: true,
        prizes: true,
        sport: true,
        participants: {
          player: true,
        },
      },
      where: {
        facility: {
          owner: {
            id: ownerId,
          },
        },
      },
    });
  }

  public async getMyRegister(playerId: UUID): Promise<Event[]> {
    return await this.eventRepository.find({
      relations: {
        facility: true,
        prizes: true,
        sport: true,
        participants: {
          player: true,
        },
      },
      where: {
        participants: {
          player: {
            id: playerId,
          },
        },
      },
    });
  }

  public async getDetail(eventId: UUID): Promise<Event> {
    return await this.eventRepository
      .findOneOrFail({
        relations: {
          facility: true,
          prizes: true,
          sport: true,
          participants: {
            player: true,
          },
        },
        where: {
          id: eventId,
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the event');
      });
  }

  public async register(
    registerEventDto: RegisterEventDto,
    playerId: UUID,
  ): Promise<{ message: string }> {
    const event = await this.eventRepository
      .findOneOrFail({
        relations: {
          participants: true,
        },
        where: {
          id: registerEventDto.eventId,
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the event');
      });

    const numberAcceptedPlayer = event.participants.reduce(
      (prev, curr) =>
        (prev += curr.status === EventParticipantStatusEnum.ACCEPTED ? 1 : 0),
      0,
    );

    console.log(numberAcceptedPlayer);

    if (numberAcceptedPlayer >= event.numberOfParticipant) {
      throw new BadRequestException('The event is full');
    }

    const newParticipant = this.eventParticipantRepository.create({
      event,
      playerId,
      note: registerEventDto.note,
    });

    await this.eventParticipantRepository.save(newParticipant);

    return {
      message: 'register event successful',
    };
  }

  public async decideRegister(
    participantDto: ParticipantDto,
    ownerId: UUID,
    status: EventParticipantStatusEnum,
  ): Promise<{ message: string }> {
    const participant = await this.eventParticipantRepository
      .findOneOrFail({
        where: {
          eventId: participantDto.eventId,
          playerId: participantDto.playerId,
          event: {
            facility: {
              owner: {
                id: ownerId,
              },
            },
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the event participant');
      });

    participant.status = status;

    await this.eventParticipantRepository.save(participant);

    return {
      message: 'Decide register successful',
    };
  }
}
