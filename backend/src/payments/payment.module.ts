import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentController } from './payment.controller';
import { VoucherModule } from 'src/vouchers/voucher.module';
import { VnpayProvider } from './providers/vnpay.provider';
import { ServiceModule } from 'src/services/service.module';
import { BookingModule } from 'src/bookings/booking.module';
import { PersonModule } from 'src/people/person.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    VoucherModule,
    forwardRef(() => ServiceModule),
    forwardRef(() => BookingModule),
    PersonModule,
  ],
  providers: [PaymentService, VnpayProvider],
  exports: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
