import { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Facility } from 'src/facilities/facility.entity';
import { Sport } from 'src/sports/sport.entity';
import { Prize } from './prize.entity';
import { EventParticipant } from './event-participant.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @ManyToOne(() => Facility, (facility) => facility.events, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  facility: Facility;

  @Column({
    type: 'varchar',
    length: 255,
    array: true,
    nullable: true,
  })
  images?: string[];

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  bannerImage: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date;

  @ManyToOne(() => Sport)
  @JoinColumn()
  sport: Sport;

  @Column({
    type: 'int4',
    nullable: false,
  })
  numberOfParticipant: number;

  @Column({
    type: 'bool',
    nullable: false,
    default: false,
  })
  isGroup: boolean;

  @Column({
    type: 'date',
    nullable: false,
  })
  startDate: Date;

  @Column({
    type: 'date',
    nullable: false,
  })
  endDate: Date;

  @Column({
    type: 'date',
    nullable: false,
  })
  endRegisterDate: Date;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  tournamentFormat: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  tournamentFormatDescription?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  rule?: string;

  @Column({
    type: 'int4',
    nullable: false,
  })
  totalPrize: number;

  @OneToMany(() => Prize, (prize) => prize.event)
  prizes: Prize[];

  @Column({
    type: 'text',
    nullable: true,
  })
  descriptionPrize?: string;

  @Column({
    type: 'bool',
    nullable: false,
  })
  isFree: boolean;

  @Column({
    type: 'int4',
    nullable: false,
  })
  totalPayment: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  desciptionPayment?: string;

  @OneToMany(() => EventParticipant, (participants) => participants.event)
  participants: EventParticipant[];
}
