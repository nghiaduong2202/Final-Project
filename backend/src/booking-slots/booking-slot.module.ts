import { Module } from '@nestjs/common';
import { BookingSlotService } from './booking-slot.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingSlot } from './booking-slot.entity';
import { BookingSlotController } from './booking-slot.controller';
import { BookingSlotCompleteTask } from './schedules/booking-slot-complete-task';

@Module({
  imports: [TypeOrmModule.forFeature([BookingSlot])],
  providers: [BookingSlotService, BookingSlotCompleteTask],
  exports: [BookingSlotService],
  controllers: [BookingSlotController],
})
export class BookingSlotModule {}
