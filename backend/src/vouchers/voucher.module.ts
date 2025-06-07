import { Module } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './voucher.entity';
import { FacilityModule } from 'src/facilities/facility.module';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher]), FacilityModule],
  providers: [VoucherService],
  controllers: [VoucherController],
  exports: [VoucherService],
})
export class VoucherModule {}
