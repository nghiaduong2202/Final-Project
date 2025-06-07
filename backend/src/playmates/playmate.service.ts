import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IPlaymateService } from './iplaymate.service';
import { UUID } from 'crypto';
import { CreatePlaymateDto } from './dtos/create-playmate.dto';
import { Repository } from 'typeorm';
import { Playmate } from './entities/playmate.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingSlotService } from 'src/booking-slots/booking-slot.service';
import { UpdatePlaymateDto } from './dtos/update-playmate.dto';
import { PlaymateParticipant } from './entities/playmate-participant.entity';
import { BookingSlot } from 'src/booking-slots/booking-slot.entity';
import { RegisterPlaymateDto } from './dtos/register-playmate.dto';
import { ParticipantDto } from './dtos/participant.dto';
import { ParticipantStatusEnum } from './enums/participant-status.enum';
import { BookingStatusEnum } from 'src/bookings/enums/booking-status.enum';
import { PlaymateGateway } from './playmate.gateway';

@Injectable()
export class PlaymateService implements IPlaymateService {
  constructor(
    /**
     * inject PlaymateRepository
     */
    @InjectRepository(Playmate)
    private readonly playmateRepository: Repository<Playmate>,
    /**
     * inject BookingSlotService
     */
    private readonly bookingSlotService: BookingSlotService,
    /**
     * inject PlaymateParticipantRepository
     */
    @InjectRepository(PlaymateParticipant)
    private readonly playmateParticipantRepository: Repository<PlaymateParticipant>,
    /**
     * inject SocketGateway
     */
    private readonly playmateGateway: PlaymateGateway,
  ) {}

  private async isBookingSlotCreated(bookingSlotId: number): Promise<boolean> {
    const existingPlaymate = await this.playmateRepository.findOne({
      where: {
        bookingSlot: {
          id: bookingSlotId,
        },
      },
    });

    return existingPlaymate ? true : false;
  }

  private async findBookingSlotAndCheck(
    bookingSlotId: number,
    playerId: UUID,
  ): Promise<BookingSlot> {
    const bookingSlot = await this.bookingSlotService.findOneByIdAndPlayer(
      bookingSlotId,
      playerId,
      [
        'booking.payment',
        'booking.player',
        'booking.sport',
        'field.fieldGroup.facility',
      ],
    );

    if (bookingSlot.booking.status !== BookingStatusEnum.COMPLETED) {
      throw new BadRequestException('The booking must be completed');
    }

    return bookingSlot;
  }

  public async create(
    createPlaymateDto: CreatePlaymateDto,
    playerId: UUID,
  ): Promise<{ message: string }> {
    const bookingSlot = await this.findBookingSlotAndCheck(
      createPlaymateDto.bookingSlotId,
      playerId,
    );

    if (await this.isBookingSlotCreated(createPlaymateDto.bookingSlotId)) {
      throw new BadRequestException('The booking slot have created yet');
    }

    const playmate = this.playmateRepository.create({
      ...createPlaymateDto,
      bookingSlot,
    });

    console.log(playmate);

    try {
      await this.playmateRepository.save(playmate);

      this.playmateGateway.emitNewPlaymante(playmate);
    } catch {
      throw new BadRequestException(
        'An error occurred when create new playmate',
      );
    }

    return {
      message: 'Create playmate successful',
    };
  }

  public async update(
    updatePlaymateDto: UpdatePlaymateDto,
    playerId: UUID,
  ): Promise<{ message: string }> {
    const playmate = await this.playmateRepository
      .findOneOrFail({
        relations: {
          bookingSlot: {
            booking: {
              player: true,
              sport: true,
            },
            field: {
              fieldGroup: {
                facility: true,
              },
            },
          },
          participants: {
            player: true,
          },
        },
        where: {
          id: updatePlaymateDto.playmateId,
          bookingSlot: {
            booking: {
              player: {
                id: playerId,
              },
            },
          },
        },
      })
      .catch(() => {
        throw new BadRequestException('Not found the playmate');
      });

    try {
      if (updatePlaymateDto.title) playmate.title = updatePlaymateDto.title;

      if (updatePlaymateDto.imagesUrl)
        playmate.imagesUrl = updatePlaymateDto.imagesUrl;

      if (updatePlaymateDto.bookingSlotId) {
        const bookingSlot = await this.findBookingSlotAndCheck(
          updatePlaymateDto.bookingSlotId,
          playerId,
        );

        playmate.bookingSlot = bookingSlot;
      }

      if (updatePlaymateDto.description)
        playmate.description = updatePlaymateDto.description;

      if (updatePlaymateDto.additionalInfor)
        playmate.additionalInfo = updatePlaymateDto.additionalInfor;

      if (updatePlaymateDto.costType)
        playmate.costType = updatePlaymateDto.costType;

      if (updatePlaymateDto.totalCost)
        playmate.totalCost = updatePlaymateDto.totalCost;

      if (updatePlaymateDto.maleCost)
        playmate.maleCost = updatePlaymateDto.maleCost;

      if (updatePlaymateDto.femaleCost)
        playmate.femaleCost = updatePlaymateDto.femaleCost;

      if (updatePlaymateDto.detailOfCost)
        playmate.detailOfCost = updatePlaymateDto.detailOfCost;

      if (updatePlaymateDto.isTeam) playmate.isTeam = updatePlaymateDto.isTeam;

      if (updatePlaymateDto.numberOfParticipants)
        playmate.numberOfParticipants = updatePlaymateDto.numberOfParticipants;

      if (updatePlaymateDto.positions)
        playmate.positions = updatePlaymateDto.positions;

      if (updatePlaymateDto.genderPreference)
        playmate.genderPreference = updatePlaymateDto.genderPreference;

      if (updatePlaymateDto.skillLevel)
        playmate.skillLevel = updatePlaymateDto.skillLevel;

      await this.playmateRepository.save(playmate);

      this.playmateGateway.emitUpdatePlaymate(playmate);
    } catch (error) {
      throw new BadRequestException(String(error));
    }

    return {
      message: 'Update playmate successful',
    };
  }

  public async register(
    registerPlaymateDto: RegisterPlaymateDto,
    playerId: UUID,
  ): Promise<{ message: string }> {
    const playmate = await this.playmateRepository
      .findOneOrFail({
        relations: {
          participants: true,
          bookingSlot: {
            booking: {
              player: true,
            },
          },
        },
        where: {
          id: registerPlaymateDto.playmateId,
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the playmate');
      });

    if (playmate.bookingSlot.booking.player.id === playerId) {
      throw new BadRequestException('You are owner of the post');
    }

    for (const participant of playmate.participants) {
      if (participant.playerId === playerId) {
        throw new BadRequestException('You have registed this post yet');
      }
    }

    const numberofAcceptParticipant = playmate.participants.filter(
      (participant) => participant.status === ParticipantStatusEnum.ACCEPTED,
    ).length;

    if (numberofAcceptParticipant >= playmate.numberOfParticipants) {
      throw new BadRequestException('The playmate is max participant');
    }

    const participant = this.playmateParticipantRepository.create({
      ...registerPlaymateDto,
      playerId,
      playmate,
    });

    await this.playmateParticipantRepository.save(participant);

    return {
      message: 'Register successfull',
    };
  }

  public async getMany(): Promise<Playmate[]> {
    const playmates = await this.playmateRepository.find({
      relations: {
        bookingSlot: {
          booking: {
            player: true,
            sport: true,
          },
          field: {
            fieldGroup: {
              facility: true,
            },
          },
        },
        participants: {
          player: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return playmates;
  }

  public async getDetail(playmateId: UUID): Promise<Playmate> {
    const playmate = await this.playmateRepository
      .findOneOrFail({
        relations: {
          bookingSlot: {
            booking: {
              player: true,
              sport: true,
            },
            field: {
              fieldGroup: {
                facility: true,
              },
            },
          },
          participants: {
            player: true,
          },
        },
        where: {
          id: playmateId,
        },
      })
      .catch(() => {
        throw new BadRequestException('Not found the playmate');
      });

    return playmate;
  }

  public async getMyPost(playerId: UUID): Promise<Playmate[]> {
    return await this.playmateRepository.find({
      relations: {
        bookingSlot: {
          booking: {
            sport: true,
          },
          field: {
            fieldGroup: {
              facility: true,
            },
          },
        },
        participants: {
          player: true,
        },
      },
      where: {
        bookingSlot: {
          booking: {
            player: {
              id: playerId,
            },
          },
        },
      },
    });
  }

  public async getMyRegister(playerId: UUID): Promise<Playmate[]> {
    return await this.playmateRepository.find({
      relations: {
        bookingSlot: {
          booking: {
            player: true,
            sport: true,
          },
          field: {
            fieldGroup: {
              facility: true,
            },
          },
        },
        participants: true,
      },
      where: {
        participants: {
          playerId,
        },
      },
    });
  }

  private async findPlaymateAndCheckOwner(playmateId: UUID, ownerId: UUID) {
    const playmate = await this.playmateRepository
      .findOneOrFail({
        relations: {
          bookingSlot: {
            booking: {
              player: true,
              sport: true,
            },
          },
          participants: true,
        },
        where: {
          id: playmateId,
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the playmate');
      });

    console.log('owner: ', playmate.bookingSlot.booking.player.id);
    console.log('player: ', ownerId);

    if (playmate.bookingSlot.booking.player.id !== ownerId) {
      throw new BadRequestException('You are not the owner of this playmate');
    }

    return playmate;
  }

  public async decideRegister(
    participantDto: ParticipantDto,
    playerId: UUID,
    status: ParticipantStatusEnum,
  ): Promise<{ message: string }> {
    const playmate = await this.findPlaymateAndCheckOwner(
      participantDto.playmateId,
      playerId,
    );

    // check number of accept must be less than max participant
    if (status === ParticipantStatusEnum.ACCEPTED) {
      const numberofAcceptParticipant = playmate.participants.filter(
        (participant) => participant.status === ParticipantStatusEnum.ACCEPTED,
      ).length;

      if (numberofAcceptParticipant >= playmate.numberOfParticipants) {
        throw new BadRequestException('The playmate is max participant');
      }
    }

    const participant = await this.playmateParticipantRepository
      .findOneOrFail({
        where: {
          playerId: participantDto.playerId,
          playmateId: participantDto.playmateId,
        },
      })
      .catch(() => {
        throw new NotFoundException(
          'Not found the participant in this playmate',
        );
      });

    if (participant.status !== ParticipantStatusEnum.PENDING) {
      throw new BadRequestException('The participant is not pending');
    }

    participant.status = status;

    await this.playmateParticipantRepository.save(participant);

    return {
      message: 'Accept participant successful',
    };
  }
}
