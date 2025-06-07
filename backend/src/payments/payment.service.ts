import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IPaymentService } from './ipayment.service';
import { Booking } from 'src/bookings/booking.entity';
import { Between, DataSource, EntityManager, Not, Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { UUID } from 'crypto';
import { PaymentDto } from './dtos/requests/payment.dto';
import { VoucherService } from 'src/vouchers/voucher.service';
import { VoucherTypeEnum } from 'src/vouchers/enums/voucher-type.enum';
import { VnpayProvider } from './providers/vnpay.provider';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingStatusEnum } from 'src/bookings/enums/booking-status.enum';
import { Person } from 'src/people/person.entity';
import { GenerateMonthlyReportDto } from './dtos/requests/generate-monthly-report.dto';
import { BookingSlotStatusEnum } from 'src/booking-slots/enums/booking-slot-status.enum';
import { PersonService } from 'src/people/person.service';

@Injectable()
export class PaymentService implements IPaymentService {
  constructor(
    /**
     * inject paymentRepository
     */
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    /**
     * inject VoucherService
     */
    private readonly voucherService: VoucherService,
    /**
     * inject DataSource
     */
    private readonly dataSource: DataSource,
    /**
     * inject VnpayProvier
     */
    private readonly vnpayProvider: VnpayProvider,
    /**
     * inject PersonService
     */
    private readonly personService: PersonService,
  ) {}

  public async createWithTransaction(
    fieldPrice: number,
    booking: Booking,
    manager: EntityManager,
  ): Promise<Payment> {
    const payment = manager.create(Payment, {
      fieldPrice,
      booking,
    });

    return await manager.save(payment);
  }

  public async payment(
    paymentId: UUID,
    paymentDto: PaymentDto,
    playerId: UUID,
    req: Request,
  ): Promise<{ paymentUrl: string }> {
    // get payment
    const payment = await this.paymentRepository
      .findOneOrFail({
        relations: {
          booking: {
            bookingSlots: {
              field: {
                fieldGroup: {
                  facility: true,
                },
              },
            },
          },
        },
        where: {
          id: paymentId,
          booking: {
            player: {
              id: playerId,
            },
          },
        },
      })
      .catch(() => {
        throw new NotFoundException(
          `Not found the payment by id: ${paymentId}`,
        );
      });

    if (payment.booking.status !== BookingStatusEnum.INCOMPLETE) {
      throw new BadRequestException('The booking must be incomplete');
    }

    return await this.dataSource.transaction<{ paymentUrl: string }>(
      async (manager) => {
        if (paymentDto.voucherId) {
          const voucher = await this.voucherService.findOneById(
            paymentDto.voucherId,
            ['facility'],
          );

          if (
            voucher.facility.id !==
            payment.booking.bookingSlots[0].field.fieldGroup.facility.id
          ) {
            throw new BadRequestException(
              'The voucher not apply for this payment',
            );
          }

          const today = new Date();

          if (today < voucher.startDate) {
            throw new BadRequestException('Voucher has not started yet');
          }

          if (today > voucher.endDate) {
            throw new BadRequestException('Voucher has expired');
          }

          if (voucher.remain === 0) {
            throw new BadRequestException('Voucher is out of stock');
          }

          const totalPrice =
            payment.fieldPrice +
            (payment.servicePrice ? payment.servicePrice : 0);

          if (totalPrice < voucher.minPrice) {
            throw new BadRequestException(
              'Total price must be greater than min price of voucher',
            );
          }

          voucher.remain -= 1;

          await manager.save(voucher);

          if (voucher.voucherType === VoucherTypeEnum.CASH) {
            payment.discount = voucher.discount;
          } else if (voucher.voucherType === VoucherTypeEnum.PERCENT) {
            payment.discount = totalPrice * (voucher.discount / 100);
          }
        }

        if (paymentDto.refundedPoint) {
          // get player
          const player = await manager
            .findOneOrFail(Person, {
              where: {
                id: playerId,
              },
            })
            .catch(() => {
              throw new BadRequestException('Not found the player');
            });

          if (player.refundedPoint < paymentDto.refundedPoint) {
            throw new BadRequestException(
              'The player has refunded points lower than required',
            );
          }

          player.refundedPoint -= paymentDto.refundedPoint;

          await manager.save(player);

          payment.refundedPoint = paymentDto.refundedPoint;
        }

        await manager.save(payment);

        // if(paymentDto.paymentOption ===)

        return this.vnpayProvider.payment(payment, req);
      },
    );
  }

  public async ipn(req: Request): Promise<{ message: string }> {
    return await this.vnpayProvider.ipn(req);
  }

  public async monthlyRevenue(
    month: number,
    year: number,
    ownerId: UUID,
    facilityId?: UUID,
  ) {
    const firstDate = new Date(year, month, 1, 7);
    const lastDate = new Date(year, month + 1, 0, 7);

    const payments = await this.paymentRepository.find({
      relations: {
        booking: {
          bookingSlots: true,
          player: true,
        },
      },
      where: {
        booking: {
          bookingSlots: {
            field: {
              fieldGroup: {
                facility: {
                  id: facilityId,
                  owner: {
                    id: ownerId,
                  },
                },
              },
            },
            date: Between(firstDate, lastDate),
          },
          status: Not(BookingStatusEnum.INCOMPLETE),
        },
      },
    });

    let revenue = 0;

    const playerMap = new Map<UUID, number>();

    for (const payment of payments) {
      const totalPrice =
        payment.fieldPrice +
        (payment.servicePrice ? payment.servicePrice : 0) -
        (payment.refund ? payment.refund : 0);

      if (payment.booking.status === BookingStatusEnum.CANCELED) {
        revenue += totalPrice;
      }

      const playNumber = payment.booking.bookingSlots.reduce(
        (prev, curr) =>
          prev + (curr.status === BookingSlotStatusEnum.DONE ? 1 : 0),
        0,
      );

      revenue +=
        totalPrice * (playNumber / payment.booking.bookingSlots.length);

      if (payment.booking.player) {
        const currentValue = playerMap.get(payment.booking.player.id) ?? 0;

        playerMap.set(payment.booking.player.id, currentValue + 1);
      }
    }

    const topPlayer = Array.from(playerMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const resultTopPlayer = await Promise.all(
      topPlayer.map(async (player) => {
        const playerInfo = await this.personService.findOneById(player[0]);
        return {
          player: playerInfo,
          amount: player[1],
        };
      }),
    );

    console.log(resultTopPlayer);

    return {
      revenue,
      bookingCount: payments.length,
      playerCount: playerMap.size,
      topPlayer: resultTopPlayer,
    };
  }

  public async generateMonthlyReport(
    generateMonthlyReportDto: GenerateMonthlyReportDto,
    ownerId: UUID,
    facilityId?: UUID,
  ): Promise<any> {
    // Lay ra nhung payment da thanh toan
    // Tinh doanh thu
    const { revenue, bookingCount, playerCount, topPlayer } =
      await this.monthlyRevenue(
        generateMonthlyReportDto.month - 1,
        generateMonthlyReportDto.year,
        ownerId,
        facilityId,
      );

    console.log(topPlayer);

    const {
      revenue: prevMonthRevenue,
      bookingCount: prevMonthBookingCount,
      playerCount: prevMonthPlayerCount,
      topPlayer: prevMonthTopPlayer,
    } = await this.monthlyRevenue(
      generateMonthlyReportDto.month - 2,
      generateMonthlyReportDto.year,
      ownerId,
      facilityId,
    );

    // Tinh luong khach hang
    // Tinh ti le khac hang quay lai
    // hien thi bieu do doanh thu
    // hien thi phan bo doanh thu theo mon the thao
    // hien thi top field group duoc dat nhieu nhat va so luong booking
    // hien thi top 5 nguoi choi dat nhieu nhat

    return {
      revenue,
      prevMonthRevenue,
      bookingCount,
      prevMonthBookingCount,
      playerCount,
      prevMonthPlayerCount,
      topPlayer,
      prevMonthTopPlayer,
    };
  }

  public async ownerPayment(
    paymentId: UUID,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    console.log('ownerId: ', ownerId);
    const payment = await this.paymentRepository
      .findOneOrFail({
        relations: {
          booking: true,
        },
        where: {
          id: paymentId,
          booking: {
            bookingSlots: {
              field: {
                fieldGroup: {
                  facility: {
                    owner: {
                      id: ownerId,
                    },
                  },
                },
              },
            },
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the payment');
      });

    if (payment.booking.status !== BookingStatusEnum.INCOMPLETE) {
      throw new BadRequestException('The booking must be incomplete');
    }

    await this.dataSource.transaction(async (manager) => {
      const booking = payment.booking;

      booking.status = BookingStatusEnum.COMPLETED;

      await manager.save(booking);
    });

    return {
      message: 'Owner payment successful',
    };
  }
}
