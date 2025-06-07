import { UUID } from 'crypto';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { EventParticipantStatusEnum } from '../enums/event-participant-status.enum';
import { Event } from './event.entity';
import { Person } from 'src/people/person.entity';

@Entity()
export class EventParticipant {
  @PrimaryColumn()
  eventId: UUID;

  @PrimaryColumn()
  playerId: UUID;

  @ManyToOne(() => Event, (event) => event.participants)
  @JoinColumn({
    name: 'eventId',
  })
  event: Event;

  @Column({
    type: 'text',
    nullable: true,
  })
  note?: string;

  @Column({
    type: 'enum',
    enum: EventParticipantStatusEnum,
    default: EventParticipantStatusEnum.PENDING,
  })
  status: EventParticipantStatusEnum;

  @ManyToOne(() => Person)
  @JoinColumn({
    name: 'playerId',
  })
  player: Person;
}
