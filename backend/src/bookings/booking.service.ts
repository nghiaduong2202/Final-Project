import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { IBookingService } from './ibooking.service';
import { UUID } from 'crypto';
import { Booking } from './booking.entity';
import { CreateDraftBookingDto } from './dtos/requests/create-draft-booking.dto';
import {
  Between,
  DataSource,
  EntityManager,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { FieldService } from 'src/fields/field.service';
import { isBetweenTime } from 'src/util/is-between-time';
import { PersonService } from 'src/people/person.service';
import { SportService } from 'src/sports/sport.service';
import { BookingSlot } from 'src/booking-slots/booking-slot.entity';
import { BookingSlotService } from 'src/booking-slots/booking-slot.service';
import { duration } from 'src/util/duration';
import { durationOverlapTime } from 'src/util/duration-overlap-time';
import { PaymentService } from 'src/payments/payment.service';
import { UpdateBookingSlotDto } from './dtos/requests/update-booking-slot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingStatusEnum } from './enums/booking-status.enum';
import { UpdateAdditionalServicesDto } from './dtos/requests/update-additional-services.dto';
import { AdditionalService } from 'src/additional-services/additional-service.entity';
import { ServiceService } from 'src/services/service.service';
import { AdditionalServiceService } from 'src/additional-services/additional-service.service';
import { UnitEnum } from 'src/services/enums/unit.enum';
import { FacilityStatusEnum } from 'src/facilities/enums/facility-status.enum';
import { FieldStatusEnum } from 'src/fields/enums/field-status.enum';
import { FacilityService } from 'src/facilities/facility.service';
import { GetScheduleDto } from './dtos/requests/get-schedule.dto';
import { BookingSlotStatusEnum } from 'src/booking-slots/enums/booking-slot-status.enum';
import { CreateDraftBookingByOwnerDto } from './dtos/requests/create-draft-booking-by-owner.dto';

@Injectable()
export class BookingService implements IBookingService {
  constructor(
    /**
     * inject FieldService
     */
    private readonly fieldService: FieldService,
    /**
     *
     * inject DataSource
     */
    private readonly dataSource: DataSource,
    /**
     * inject PersonService
     */
    private readonly personService: PersonService,
    /**
     * inject SportService
     */
    private readonly sportService: SportService,
    /**
     * inject BookingSlotService
     */
    private readonly bookingSlotService: BookingSlotService,
    /**
     * inject PaymentService
     */
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    /**
     * inject BookingRepository
     */
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    /**
     * inject ServiceService
     */
    @Inject(forwardRef(() => ServiceService))
    private readonly serviceService: ServiceService,
    /**
     * inject AdditionalService
     */
    private readonly additionalServiceService: AdditionalServiceService,
    /**
     * inject FacilityService
     */
    private readonly facilityService: FacilityService,
  ) {}

  public async createDraft(
    createDraftBookingDto: CreateDraftBookingDto,
    playerId: UUID,
  ): Promise<Booking> {
    if (createDraftBookingDto.bookingSlots.length === 0)
      throw new BadRequestException('You must choose at least one field');

    const firstField = await this.fieldService.findOneById(
      createDraftBookingDto.bookingSlots[0].fieldId,
      ['fieldGroup.facility'],
    );

    if (firstField.fieldGroup.facility.status !== FacilityStatusEnum.ACTIVE) {
      throw new BadRequestException('The facility of field must be actived');
    }

    const fieldGroupId = firstField.fieldGroup.id;
    const facility = firstField.fieldGroup.facility;

    // check startTime and endTime between active time of facility
    if (
      isBetweenTime(
        createDraftBookingDto.startTime,
        createDraftBookingDto.endTime,
        facility.openTime1,
        facility.closeTime1,
      ) &&
      facility.openTime2 &&
      facility.closeTime2 &&
      isBetweenTime(
        createDraftBookingDto.startTime,
        createDraftBookingDto.endTime,
        facility.openTime2,
        facility.closeTime2,
      ) &&
      facility.openTime3 &&
      facility.closeTime3 &&
      isBetweenTime(
        createDraftBookingDto.startTime,
        createDraftBookingDto.endTime,
        facility.openTime3,
        facility.closeTime3,
      )
    ) {
      throw new BadRequestException(
        'Booking time not between open time and close time',
      );
    }

    return await this.dataSource.transaction<Booking>(async (manager) => {
      // get player by id
      const player = await this.personService.findOneByIdWithTransaction(
        playerId,
        manager,
      );

      // get sport by id
      const sport = await this.sportService.findOneByIdWithTransaction(
        createDraftBookingDto.sportId,
        manager,
      );

      // create booking
      const booking = manager.create(Booking, {
        ...createDraftBookingDto,
        player,
        sport,
      });

      await manager.save(booking);

      const bookingSlots: BookingSlot[] = [];

      let fieldPrice = 0;

      // check and create bookingSlots
      for (const bookingSlot of createDraftBookingDto.bookingSlots) {
        // get field by id
        const field = await this.fieldService.findOneByIdWithTransaction(
          bookingSlot.fieldId,
          manager,
          ['fieldGroup.facility', 'fieldGroup.sports'],
        );

        if (field.status === FieldStatusEnum.CLOSED) {
          throw new BadRequestException(`${field.name} field  is closed`);
        }

        // check fields have same field group
        if (field.fieldGroup.id !== fieldGroupId) {
          throw new BadRequestException('Fields must have same field group');
        }

        // check field includes sport
        if (
          !field.fieldGroup.sports.find(
            (sport) => sport.id === createDraftBookingDto.sportId,
          )
        ) {
          throw new BadRequestException('Field does not include this sport');
        }

        // check not overlap with other booking
        await this.checkOverlapBookingsWithTransaction(
          bookingSlot.fieldId,
          bookingSlot.date,
          createDraftBookingDto.startTime,
          createDraftBookingDto.endTime,
          manager,
        );

        // create bookingSlot
        const newBookingSlot =
          await this.bookingSlotService.createWithTransaction(
            field,
            bookingSlot.date,
            booking,
            manager,
          );

        bookingSlots.push(newBookingSlot);

        const playTime = duration(
          createDraftBookingDto.endTime,
          createDraftBookingDto.startTime,
        );

        fieldPrice += field.fieldGroup.basePrice * playTime;

        if (field.fieldGroup.numberOfPeaks > 0) {
          const overlapPeak = durationOverlapTime(
            field.fieldGroup.peakStartTime1!,
            field.fieldGroup.peakEndTime1!,
            createDraftBookingDto.startTime,
            createDraftBookingDto.endTime,
          );

          fieldPrice += overlapPeak * field.fieldGroup.priceIncrease1!;
        }

        if (field.fieldGroup.numberOfPeaks > 1) {
          const overlapPeak = durationOverlapTime(
            field.fieldGroup.peakStartTime2!,
            field.fieldGroup.peakEndTime2!,
            createDraftBookingDto.startTime,
            createDraftBookingDto.endTime,
          );

          fieldPrice += overlapPeak * field.fieldGroup.priceIncrease2!;
        }

        if (field.fieldGroup.numberOfPeaks > 2) {
          const overlapPeak = durationOverlapTime(
            field.fieldGroup.peakStartTime3!,
            field.fieldGroup.peakEndTime3!,
            createDraftBookingDto.startTime,
            createDraftBookingDto.endTime,
          );

          fieldPrice += overlapPeak * field.fieldGroup.priceIncrease3!;
        }
      }

      // create payment
      const payment = await this.paymentService.createWithTransaction(
        fieldPrice,
        booking,
        manager,
      );

      booking.payment = payment;
      booking.bookingSlots = bookingSlots;

      return booking;
    });
  }

  private async checkOverlapBookingsWithTransaction(
    fieldId: number,
    date: Date,
    startTime: string,
    endTime: string,
    manager: EntityManager,
  ) {
    const overlapBooking = await manager.findOne(Booking, {
      where: [
        {
          bookingSlots: {
            field: {
              id: fieldId,
            },
            date: date,
          },
          startTime: Between(startTime, endTime),
          status: Not(BookingStatusEnum.CANCELED),
        },
        {
          bookingSlots: {
            field: {
              id: fieldId,
            },
            date: date,
          },
          endTime: Between(startTime, endTime),
          status: Not(BookingStatusEnum.CANCELED),
        },
        {
          bookingSlots: {
            field: {
              id: fieldId,
            },
            date: date,
          },
          startTime: LessThanOrEqual(startTime),
          endTime: MoreThanOrEqual(endTime),
          status: Not(BookingStatusEnum.CANCELED),
        },
      ],
    });

    if (overlapBooking) {
      throw new BadRequestException(
        'Booking time overlap with another booking',
      );
    }
  }

  public async updateBookingSlot(
    bookingId: UUID,
    updateBookingSlotDto: UpdateBookingSlotDto,
    playerId: UUID,
  ): Promise<Booking> {
    const booking = await this.findOneByIdAndPlayer(bookingId, playerId, [
      'sport',
      'bookingSlots',
      'payment',
    ]);

    if (booking.status !== BookingStatusEnum.INCOMPLETE) {
      throw new BadRequestException('The booking must be incomplete');
    }

    if (updateBookingSlotDto.bookingSlots.length === 0) {
      throw new BadRequestException('You must choose at least one field');
    }

    const firstField = await this.fieldService.findOneById(
      updateBookingSlotDto.bookingSlots[0].fieldId,
      ['fieldGroup'],
    );

    return await this.dataSource.transaction<Booking>(async (manager) => {
      // delete old booking slots
      for (const bookingSlot of booking.bookingSlots) {
        await manager.remove(bookingSlot);
      }

      let fieldPrice = 0;

      const bookingSlots: BookingSlot[] = [];

      for (const bookingSlot of updateBookingSlotDto.bookingSlots) {
        const field = await this.fieldService.findOneByIdWithTransaction(
          bookingSlot.fieldId,
          manager,
          ['fieldGroup.facility', 'fieldGroup.sports'],
        );

        if (field.fieldGroup.id !== firstField.fieldGroup.id) {
          throw new BadRequestException('Fields must have same field group');
        }

        if (
          !field.fieldGroup.sports.find(
            (sport) => sport.id === booking.sport.id,
          )
        ) {
          throw new BadRequestException('Field does not include this sport');
        }

        await this.checkOverlapBookingsWithTransaction(
          bookingSlot.fieldId,
          bookingSlot.date,
          booking.startTime,
          booking.endTime,
          manager,
        );

        const newBookingSlot =
          await this.bookingSlotService.createWithTransaction(
            field,
            bookingSlot.date,
            booking,
            manager,
          );

        bookingSlots.push(newBookingSlot);
      }

      const playTime = duration(booking.endTime, booking.startTime);

      fieldPrice =
        playTime *
        firstField.fieldGroup.basePrice *
        updateBookingSlotDto.bookingSlots.length;

      if (firstField.fieldGroup.numberOfPeaks > 0) {
        const overlapPeak = durationOverlapTime(
          firstField.fieldGroup.peakStartTime1!,
          firstField.fieldGroup.peakEndTime1!,
          booking.startTime,
          booking.endTime,
        );

        fieldPrice +=
          overlapPeak *
          firstField.fieldGroup.priceIncrease1! *
          updateBookingSlotDto.bookingSlots.length;
      }

      if (firstField.fieldGroup.numberOfPeaks > 1) {
        const overlapPeak = durationOverlapTime(
          firstField.fieldGroup.peakStartTime2!,
          firstField.fieldGroup.peakEndTime2!,
          booking.startTime,
          booking.endTime,
        );

        fieldPrice +=
          overlapPeak *
          firstField.fieldGroup.priceIncrease2! *
          updateBookingSlotDto.bookingSlots.length;
      }

      if (firstField.fieldGroup.numberOfPeaks > 2) {
        const overlapPeak = durationOverlapTime(
          firstField.fieldGroup.peakStartTime3!,
          firstField.fieldGroup.peakEndTime3!,
          booking.startTime,
          booking.endTime,
        );

        fieldPrice +=
          overlapPeak *
          firstField.fieldGroup.priceIncrease3! *
          updateBookingSlotDto.bookingSlots.length;
      }

      const payment = booking.payment;
      payment.fieldPrice = fieldPrice;

      await manager.save(payment);

      booking.payment = payment;
      booking.bookingSlots = bookingSlots;

      return booking;
    });
  }

  public async findOneByIdAndPlayer(
    bookingId: UUID,
    playerId?: UUID,
    relations?: string[],
  ): Promise<Booking> {
    return this.bookingRepository
      .findOneOrFail({
        relations,
        where: {
          id: bookingId,
          player: {
            id: playerId,
          },
        },
      })
      .catch(() => {
        throw new NotFoundException(
          `Not found booking id: ${bookingId} with the player`,
        );
      });
  }

  public async updateAdditionalServices(
    bookingId: UUID,
    updateAdditionalServiceDto: UpdateAdditionalServicesDto,
    playerId?: UUID,
  ): Promise<Booking> {
    const booking = await this.findOneByIdAndPlayer(bookingId, playerId, [
      'sport',
      'additionalServices',
      'bookingSlots',
      'payment',
    ]);

    if (booking.status !== BookingStatusEnum.INCOMPLETE) {
      throw new BadRequestException('The booking must be incomplete');
    }

    const playTime = duration(booking.startTime, booking.endTime);

    return await this.dataSource.transaction<Booking>(async (manager) => {
      // remove old additional service
      for (const additionalService of booking.additionalServices) {
        await manager.remove(additionalService);
      }

      let servicePrice = 0;

      const additionalServices: AdditionalService[] = [];

      for (const additionalService of updateAdditionalServiceDto.additionalServices) {
        const service = await this.serviceService.findOneByIdWithTransaction(
          additionalService.serviceId,
          manager,
          ['sport'],
        );

        for (const bookingSlot of booking.bookingSlots) {
          const overLapAdditionalServices = await manager.find(
            AdditionalService,
            {
              where: [
                {
                  serviceId: additionalService.serviceId,
                  booking: {
                    bookingSlots: {
                      date: bookingSlot.date,
                    },
                    status: Not(BookingStatusEnum.CANCELED),
                    startTime: Between(booking.startTime, booking.endTime),
                  },
                },
                {
                  serviceId: additionalService.serviceId,
                  booking: {
                    bookingSlots: {
                      date: bookingSlot.date,
                    },
                    status: Not(BookingStatusEnum.CANCELED),
                    endTime: Between(booking.startTime, booking.endTime),
                  },
                },
                {
                  serviceId: additionalService.serviceId,
                  booking: {
                    bookingSlots: {
                      date: bookingSlot.date,
                    },
                    status: Not(BookingStatusEnum.CANCELED),
                    startTime: LessThanOrEqual(booking.startTime),
                    endTime: MoreThanOrEqual(booking.endTime),
                  },
                },
              ],
            },
          );

          const amountOfServiceRetend = overLapAdditionalServices.reduce(
            (prev, curr) => prev + curr.quantity,
            0,
          );

          if (
            service.amount <
            amountOfServiceRetend + additionalService.quantity
          ) {
            throw new BadRequestException(
              `Service ${additionalService.serviceId} is out of stock in date ${bookingSlot.date.toISOString()}}`,
            );
          }
        }

        if (service.unit === UnitEnum.QUANTITY) {
          // caculator follow quantity

          servicePrice +=
            service.price *
            additionalService.quantity *
            booking.bookingSlots.length;
        } else {
          servicePrice +=
            service.price *
            additionalService.quantity *
            booking.bookingSlots.length *
            playTime;
        }

        const newAdditionalService =
          await this.additionalServiceService.createWithTransaction(
            booking,
            service,
            additionalService.quantity,
            manager,
          );

        additionalServices.push(newAdditionalService);
      }

      const payment = booking.payment;

      payment.servicePrice = servicePrice;
      await manager.save(payment);

      booking.additionalServices = additionalServices;

      return booking;
    });
  }

  public async findOneById(
    bookingId: UUID,
    relations?: string[],
  ): Promise<Booking> {
    // return this.bookingRepository
    //   .findOneOrFail({
    //     relations,
    //     where: {
    //       id: bookingId,
    //     },
    //   })
    //   .catch(() => {
    //     throw new BadRequestException(`Not found the booking ${bookingId}`);
    //   });

    const booking = await this.bookingRepository.findOne({
      relations,
      where: {
        id: bookingId,
      },
    });

    if (!booking) {
      throw new NotFoundException();
    }

    return booking;
  }

  public async getManyByPlayer(playerId: UUID): Promise<any[]> {
    const bookings = await this.bookingRepository.find({
      relations: {
        sport: true,
        bookingSlots: {
          field: true,
        },
        payment: true,
        review: true,
      },
      where: {
        player: {
          id: playerId,
        },
        status: Not(BookingStatusEnum.INCOMPLETE),
      },
    });

    // get facility and fieldGroup by field in booking
    return await Promise.all(
      bookings.map(async (booking) => {
        const facility = await this.facilityService.findOneByField(
          booking.bookingSlots[0].field.id,
        );

        return {
          facility,
          booking,
        };
      }),
    );
  }

  public async getManyByOwner(
    ownerID: UUID,
    facilityId?: UUID,
  ): Promise<any[]> {
    const bookings = await this.bookingRepository.find({
      relations: {
        sport: true,
        bookingSlots: {
          field: true,
          booking: {
            player: true,
          },
        },
        payment: true,
        review: true,
      },
      where: {
        bookingSlots: {
          field: {
            fieldGroup: {
              facility: {
                id: facilityId,
                owner: {
                  id: ownerID,
                },
              },
            },
          },
        },
        status: Not(BookingStatusEnum.INCOMPLETE),
      },
    });

    return await Promise.all(
      bookings.map(async (booking) => {
        const facility = await this.facilityService.findOneByField(
          booking.bookingSlots[0].field.id,
        );

        return {
          facility,
          booking,
        };
      }),
    );
  }

  public async deleteDraft(
    bookingId: UUID,
    playerId: UUID,
  ): Promise<{ message: string }> {
    const booking = await this.bookingRepository
      .findOneOrFail({
        where: {
          id: bookingId,
          player: {
            id: playerId,
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the booking');
      });

    if (booking.status !== BookingStatusEnum.INCOMPLETE) {
      throw new BadRequestException(
        'You only can delete the incomplete booking',
      );
    }

    try {
      await this.bookingRepository.remove(booking);
    } catch {
      throw new BadRequestException(
        'An error occurred when delete the incomplete booking',
      );
    }

    return {
      message: 'Delete draft booking successful',
    };
  }

  public async getDetail(bookingId: UUID): Promise<any> {
    const booking = await this.bookingRepository
      .findOneOrFail({
        relations: {
          additionalServices: {
            service: true,
          },
          bookingSlots: {
            field: true,
          },
          sport: true,
          payment: true,
          review: true,
        },
        where: {
          id: bookingId,
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the booking');
      });

    const facility = await this.facilityService.findOneByField(
      booking.bookingSlots[0].field.id,
    );

    return {
      facility,
      booking,
    };
  }

  public async getSchedule(
    getScheduleDto: GetScheduleDto,
    ownerId: UUID,
  ): Promise<any[]> {
    const result = await this.bookingRepository.find({
      relations: {
        payment: true,
        bookingSlots: {
          field: true,
        },
        player: true,
      },
      where: {
        bookingSlots: {
          date: getScheduleDto.date,
          field: {
            fieldGroup: {
              id: getScheduleDto.fieldGroupId,
              facility: {
                owner: {
                  id: ownerId,
                },
              },
            },
          },
        },
        status: Not(BookingStatusEnum.INCOMPLETE),
      },
    });

    return result.map(({ bookingSlots, ...rest }) => ({
      ...rest,
      field: bookingSlots[0].field,
    }));
  }

  public async save(booking: Booking): Promise<any> {
    await this.bookingRepository.save(booking);
  }

  public async cancelBooking(
    bookingId: UUID,
    playerId: UUID,
  ): Promise<{ message: string }> {
    const booking = await this.findOneByIdAndPlayer(bookingId, playerId, [
      'bookingSlots',
      'payment',
      'player',
    ]);

    if (booking.status !== BookingStatusEnum.COMPLETED) {
      throw new BadRequestException('The booking status must be completed');
    }

    await this.dataSource.transaction(async (manager) => {
      const currentDate = new Date();

      currentDate.setHours(0, 0, 0, 0);

      let refund = 0;

      const dayPrice =
        (booking.payment.fieldPrice +
          (booking.payment.servicePrice ? booking.payment.servicePrice : 0)) /
        booking.bookingSlots.length;

      for (const bookingSlot of booking.bookingSlots) {
        if (bookingSlot.status === BookingSlotStatusEnum.UPCOMING) {
          const dayDifference =
            (bookingSlot.date.valueOf() - currentDate.valueOf()) /
            (1000 * 3600 * 24);

          if (dayDifference >= 7) {
            refund += dayPrice;
          } else if (dayDifference >= 3) {
            refund += dayPrice * 0.5;
          }

          bookingSlot.status = BookingSlotStatusEnum.CANELED;

          await manager.save(bookingSlot);
        }
      }

      const refundedPoint = Math.floor(refund / 1000);

      const payment = booking.payment;

      payment.refund = refundedPoint;

      await manager.save(payment);

      booking.status = BookingStatusEnum.CANCELED;

      await manager.save(booking);

      const player = booking.player;

      player.refundedPoint += refundedPoint;

      await manager.save(player);
    });

    return {
      message: 'Cancel booking successful',
    };
  }

  public async createDraftByOwner(
    createDraftBookingByOnwerDto: CreateDraftBookingByOwnerDto,
    ownerId: UUID,
  ): Promise<Booking> {
    const field = await this.fieldService.findOneById(
      createDraftBookingByOnwerDto.bookingSlot.fieldId,
      ['fieldGroup.facility.owner', 'fieldGroup.sports'],
    );

    if (field.fieldGroup.facility.status !== FacilityStatusEnum.ACTIVE) {
      throw new BadRequestException('The facility of field must be active');
    }

    console.log('owner facility: ', field.fieldGroup.facility.owner.id);
    console.log('ownerId: ', ownerId);

    if (field.fieldGroup.facility.owner.id !== ownerId) {
      throw new NotAcceptableException('You must be owner of this facility');
    }

    const facility = field.fieldGroup.facility;

    // check startTime and endTime between active time of facility
    if (
      isBetweenTime(
        createDraftBookingByOnwerDto.startTime,
        createDraftBookingByOnwerDto.endTime,
        facility.openTime1,
        facility.closeTime1,
      ) &&
      facility.openTime2 &&
      facility.closeTime2 &&
      isBetweenTime(
        createDraftBookingByOnwerDto.startTime,
        createDraftBookingByOnwerDto.endTime,
        facility.openTime2,
        facility.closeTime2,
      ) &&
      facility.openTime3 &&
      facility.closeTime3 &&
      isBetweenTime(
        createDraftBookingByOnwerDto.startTime,
        createDraftBookingByOnwerDto.endTime,
        facility.openTime3,
        facility.closeTime3,
      )
    ) {
      throw new BadRequestException(
        'Booking time not between open time and close time',
      );
    }

    return await this.dataSource.transaction<Booking>(async (manager) => {
      // get sport by id
      const sport = await this.sportService.findOneByIdWithTransaction(
        createDraftBookingByOnwerDto.sportId,
        manager,
      );

      // create booking
      const booking = manager.create(Booking, {
        ...createDraftBookingByOnwerDto,
        sport,
      });

      await manager.save(booking);

      if (field.status === FieldStatusEnum.CLOSED) {
        throw new BadRequestException('The field is closed');
      }

      if (
        !field.fieldGroup.sports.find(
          (sport) => sport.id === createDraftBookingByOnwerDto.sportId,
        )
      ) {
        throw new BadRequestException('The field does not include this sport');
      }

      await this.checkOverlapBookingsWithTransaction(
        createDraftBookingByOnwerDto.bookingSlot.fieldId,
        createDraftBookingByOnwerDto.bookingSlot.date,
        createDraftBookingByOnwerDto.startTime,
        createDraftBookingByOnwerDto.endTime,
        manager,
      );

      const newBookingSlot =
        await this.bookingSlotService.createWithTransaction(
          field,
          createDraftBookingByOnwerDto.bookingSlot.date,
          booking,
          manager,
        );

      const playTime = duration(
        createDraftBookingByOnwerDto.endTime,
        createDraftBookingByOnwerDto.startTime,
      );

      let fieldPrice = field.fieldGroup.basePrice * playTime;

      if (field.fieldGroup.numberOfPeaks > 0) {
        const overlapPeak = durationOverlapTime(
          field.fieldGroup.peakStartTime1!,
          field.fieldGroup.peakEndTime1!,
          createDraftBookingByOnwerDto.startTime,
          createDraftBookingByOnwerDto.endTime,
        );

        fieldPrice += overlapPeak * field.fieldGroup.priceIncrease1!;
      }

      if (field.fieldGroup.numberOfPeaks > 1) {
        const overlapPeak = durationOverlapTime(
          field.fieldGroup.peakStartTime2!,
          field.fieldGroup.peakEndTime2!,
          createDraftBookingByOnwerDto.startTime,
          createDraftBookingByOnwerDto.endTime,
        );

        fieldPrice += overlapPeak * field.fieldGroup.priceIncrease2!;
      }

      if (field.fieldGroup.numberOfPeaks > 2) {
        const overlapPeak = durationOverlapTime(
          field.fieldGroup.peakStartTime3!,
          field.fieldGroup.peakEndTime3!,
          createDraftBookingByOnwerDto.startTime,
          createDraftBookingByOnwerDto.endTime,
        );

        fieldPrice += overlapPeak * field.fieldGroup.priceIncrease3!;
      }

      // create payment
      const payment = await this.paymentService.createWithTransaction(
        fieldPrice,
        booking,
        manager,
      );

      booking.payment = payment;
      booking.bookingSlots = [newBookingSlot];

      return booking;
    });
  }
}
