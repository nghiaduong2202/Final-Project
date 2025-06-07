import { Module } from '@nestjs/common';
import { PlaymateController } from './playmate.controller';
import { PlaymateService } from './playmate.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playmate } from './entities/playmate.entity';
import { PlaymateParticipant } from './entities/playmate-participant.entity';
import { BookingSlotModule } from 'src/booking-slots/booking-slot.module';
import { PlaymateGateway } from './playmate.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Playmate, PlaymateParticipant]),
    BookingSlotModule,
  ],
  controllers: [PlaymateController],
  providers: [PlaymateService, PlaymateGateway],
  exports: [PlaymateService],
})
export class PlaymateModule {}
