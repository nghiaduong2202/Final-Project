import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, LessThan, Repository } from 'typeorm';
import { Booking } from '../booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingStatusEnum } from '../enums/booking-status.enum';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class IncompleteBookingCleaner {
  constructor(
    /**
     * inject BookingRepository
     */
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    /**
     * inject DataSource
     */
    private readonly dataSource: DataSource,
  ) {}

  @Cron('0 */15 * * * *')
  public async cleanIncompleteBooking() {
    const fiftenMinutes = new Date(Date.now() - 15 * 60 * 1000);

    const expiredBookingDraft = await this.bookingRepository.find({
      relations: {
        player: true,
        payment: true,
      },
      where: {
        status: BookingStatusEnum.INCOMPLETE,
        updatedAt: LessThan(fiftenMinutes),
      },
    });

    console.log('expiredBookingDraft: ', expiredBookingDraft);

    try {
      // await this.bookingRepository.remove(expiredBookingDraft);
      for (const incompleteBooking of expiredBookingDraft) {
        await this.dataSource.transaction(async (manager) => {
          const payment = incompleteBooking.payment;

          if (payment.refundedPoint) {
            const player = incompleteBooking.player;

            player.refundedPoint += payment.refundedPoint;

            await manager.save(player);
          }

          await manager.remove(incompleteBooking);
        });
      }
    } catch {
      throw new InternalServerErrorException(
        'An error occurred in clean incomplete booking',
      );
    }
  }
}
