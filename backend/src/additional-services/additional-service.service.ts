import { BadRequestException, Injectable } from '@nestjs/common';
import { IAdditionalServiceService } from './iadditional-service.service';
import { Booking } from 'src/bookings/booking.entity';
import {
  Between,
  EntityManager,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { AdditionalService } from './additional-service.entity';
import { Service } from 'src/services/service.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingStatusEnum } from 'src/bookings/enums/booking-status.enum';

@Injectable()
export class AdditionalServiceService implements IAdditionalServiceService {
  constructor(
    /**
     * inject AdditionalRepository
     */
    @InjectRepository(AdditionalService)
    private readonly additionalRepository: Repository<AdditionalService>,
  ) {}

  public async createWithTransaction(
    booking: Booking,
    service: Service,
    quantity: number,
    manager: EntityManager,
  ): Promise<AdditionalService> {
    if (booking.sport.id !== service.sport.id) {
      throw new BadRequestException('The service not support for this booking');
    }

    const additionalService = manager.create(AdditionalService, {
      service,
      quantity,
      booking,
    });

    return await manager.save(additionalService);
  }

  public async findManyByServiceIdAndDate(
    serviceId: number,
    date: Date,
    startTime: string,
    endTime: string,
  ): Promise<AdditionalService[]> {
    return await this.additionalRepository.find({
      where: {
        serviceId: serviceId,
        booking: [
          {
            startTime: Between(startTime, endTime),
            bookingSlots: {
              date: date,
            },
            status: Not(BookingStatusEnum.CANCELED),
          },
          {
            endTime: Between(startTime, endTime),
            bookingSlots: {
              date: date,
            },
            status: Not(BookingStatusEnum.CANCELED),
          },
          {
            startTime: LessThanOrEqual(startTime),
            endTime: MoreThanOrEqual(endTime),
            bookingSlots: {
              date: date,
            },
            status: Not(BookingStatusEnum.CANCELED),
          },
        ],
      },
    });
  }
}
