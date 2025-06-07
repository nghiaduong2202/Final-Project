import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Payment } from '../payment.entity';
import {
  dateFormat,
  HashAlgorithm,
  ProductCode,
  ReturnQueryFromVNPay,
  VerifyReturnUrl,
  VNPay,
  VnpLocale,
} from 'vnpay';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { ServiceService } from 'src/services/service.service';
import { BookingStatusEnum } from 'src/bookings/enums/booking-status.enum';
import { BookingService } from 'src/bookings/booking.service';

@Injectable()
export class VnpayProvider {
  constructor(
    /**
     * inject ConfigService
     */
    private readonly configService: ConfigService,
    /**
     * inject PaymentRepository
     */
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    /**
     * inject ServiceService
     */
    @Inject(forwardRef(() => ServiceService))
    private readonly serviceService: ServiceService,
    /**
     * inject BookingService
     */
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
    /**
     * inject DataSource
     */
    private readonly dataSource: DataSource,
  ) {}

  public payment(payment: Payment, req: Request): { paymentUrl: string } {
    const vnpay = new VNPay({
      tmnCode: this.configService.get<string>('TMN_CODE')!,
      secureSecret: this.configService.get<string>('SECURE_SECRET')!,
      vnpayHost: 'https://sandbox.vnpayment.vn',
      testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true
      hashAlgorithm: HashAlgorithm.SHA512, // tùy chọn
    });

    const totalPrice =
      payment.fieldPrice +
      (payment.servicePrice ? payment.servicePrice : 0) -
      (payment.discount ? payment.discount : 0) -
      (payment.refundedPoint ? payment.refundedPoint * 1000 : 0);

    if (totalPrice <= 0) {
      throw new BadRequestException('Total price must be more than 0');
    }

    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: totalPrice,
      vnp_IpAddr: `${
        (req.headers['x-forwarded-for'] ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.ip) as string
      }`,
      vnp_TxnRef: payment.id,
      vnp_OrderInfo: `Thanh toan don hang ${payment.id}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ExpireDate: dateFormat(
        new Date(Date.now() + 7 * 60 * 60 * 1000 + 15 * 60 * 1000),
      ),
      vnp_ReturnUrl:
        this.configService.get<string>('VNPAY_RETURN_URL') ||
        'http://localhost:3000/payment/inp',
      vnp_Locale: VnpLocale.VN,
    });

    return {
      paymentUrl,
    };
  }

  public async ipn(req: Request): Promise<{ message: string }> {
    const vnpay = new VNPay({
      tmnCode: this.configService.get<string>('TMN_CODE')!,
      secureSecret: this.configService.get<string>('SECURE_SECRET')!,
      vnpayHost: 'https://sandbox.vnpayment.vn',
      testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true
      hashAlgorithm: HashAlgorithm.SHA512, // tùy chọn
    });

    const verify: VerifyReturnUrl = vnpay.verifyIpnCall(
      req.query as ReturnQueryFromVNPay,
    );

    if (!verify.isVerified) {
      throw new BadRequestException('Invalid request');
    }

    const payment = await this.paymentRepository
      .findOneOrFail({
        relations: {
          booking: {
            player: true,
          },
        },
        where: {
          id: verify.vnp_TxnRef as UUID,
        },
      })
      .catch(() => {
        throw new NotFoundException(
          `Not found payment by id: ${verify.vnp_TxnRef}`,
        );
      });

    if (!verify.isSuccess) {
      // remove booking and return refundedPoint
      await this.dataSource.transaction(async (manager) => {
        // return refundedPoint
        if (payment.refundedPoint) {
          const player = payment.booking.player;

          player.refundedPoint += payment.refundedPoint;

          await manager.save(player);
        }

        // remove booking
        const booking = payment.booking;
        await manager.remove(booking);
      });

      throw new BadRequestException('Payment failed');
    }

    await this.serviceService.addBookedCount(payment.booking.id);

    const booking = payment.booking;
    booking.status = BookingStatusEnum.COMPLETED;

    await this.bookingService.save(booking);

    return {
      message: 'Payment successful',
    };
  }
}
