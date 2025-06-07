import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Prize } from './entities/prize.entity';
import { EventParticipant } from './entities/event-participant.entity';
import { FacilityModule } from 'src/facilities/facility.module';
import { SportModule } from 'src/sports/sport.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Prize, EventParticipant]),
    FacilityModule,
    SportModule,
  ],
  providers: [EventService],
  controllers: [EventController],
})
export class EventModule {}
