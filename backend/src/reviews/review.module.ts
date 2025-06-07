import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './review.entity';
import { BookingModule } from 'src/bookings/booking.module';
import { CloudUploaderModule } from 'src/cloud-uploader/cloud-uploader.module';
import { FacilityModule } from 'src/facilities/facility.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    BookingModule,
    CloudUploaderModule,
    FacilityModule,
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
