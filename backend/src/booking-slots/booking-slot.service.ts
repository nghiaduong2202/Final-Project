import { BadRequestException, Injectable } from '@nestjs/common';
import { IBookingSlotService } from './ibooking-slot.service';
import { BookingSlot } from './booking-slot.entity';
import { Booking } from 'src/bookings/booking.entity';
import { Field } from 'src/fields/field.entity';
import { EntityManager, MoreThan, Repository } from 'typeorm';
import { UUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingStatusEnum } from 'src/bookings/enums/booking-status.enum';

@Injectable()
export class BookingSlotService implements IBookingSlotService {
  constructor(
    /**
     * inject BookingSlotRepository
     */
    @InjectRepository(BookingSlot)
    private readonly bookingSlotRepository: Repository<BookingSlot>,
  ) {}

  public async createWithTransaction(
    field: Field,
    date: Date,
    booking: Booking,
    manager: EntityManager,
  ): Promise<BookingSlot> {
    const bookingSlot = manager.create(BookingSlot, {
      field,
      date,
      booking,
    });

    try {
      return manager.save(bookingSlot);
    } catch {
      throw new BadRequestException(
        'An error occurred when create booking slot',
      );
    }
  }

  public async findOneByIdAndPlayer(
    bookingSlotId: number,
    playerId: UUID,
    relations?: string[],
  ): Promise<BookingSlot> {
    return await this.bookingSlotRepository
      .findOneOrFail({
        relations,
        where: {
          id: bookingSlotId,
          booking: {
            player: {
              id: playerId,
            },
          },
        },
      })
      .catch(() => {
        throw new BadRequestException(
          `Not found the booking slot with id: ${bookingSlotId} of player: ${playerId}`,
        );
      });
  }

  public async getManyForPlaymate(playerId: UUID): Promise<BookingSlot[]> {
    const now = new Date();

    const bookingSlots = await this.bookingSlotRepository.find({
      relations: {
        booking: {
          sport: true,
        },
        field: {
          fieldGroup: {
            facility: true,
          },
        },
      },
      where: {
        booking: {
          player: {
            id: playerId,
          },
          status: BookingStatusEnum.COMPLETED,
        },
        date: MoreThan(now),
      },
    });

    return bookingSlots;
  }
}
