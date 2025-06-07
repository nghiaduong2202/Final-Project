import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { BookingSlot } from '../booking-slot.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { BookingSlotStatusEnum } from '../enums/booking-slot-status.enum';

@Injectable()
export class BookingSlotCompleteTask {
  constructor(
    /**
     * inject BookingSlotRepository
     */
    @InjectRepository(BookingSlot)
    private readonly bookingSlotRepository: Repository<BookingSlot>,
  ) {}

  @Cron('0 */30 * * * *')
  public async completeTask() {
    const now = new Date().toISOString().replace('Z', '');

    const [, time] = now.split('T');

    const bookingSlots = await this.bookingSlotRepository.find({
      where:
        // date: new Date(date),
        // status: BookingSlotStatusEnum.UPCOMING,
        // booking: {
        //   startTime: MoreThan(time),
        // },
        [
          {
            status: BookingSlotStatusEnum.UPCOMING,
            date: LessThan(new Date()),
          },
          {
            status: BookingSlotStatusEnum.UPCOMING,
            date: new Date(),
            booking: {
              startTime: MoreThan(time),
            },
          },
        ],
    });

    console.log('bookingSlots: ', bookingSlots);

    const result = bookingSlots.map((bookingSlot) => {
      bookingSlot.status = BookingSlotStatusEnum.DONE;

      return bookingSlot;
    });
    try {
      await this.bookingSlotRepository.save(result);
    } catch {
      throw new InternalServerErrorException(
        'An error when complate booking slot task',
      );
    }
  }
}
