import { UUID } from 'crypto';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookingStatusEnum } from './enums/booking-status.enum';
import { Person } from 'src/people/person.entity';
import { Sport } from 'src/sports/sport.entity';
import { BookingSlot } from 'src/booking-slots/booking-slot.entity';
import { AdditionalService } from 'src/additional-services/additional-service.entity';
import { Payment } from 'src/payments/payment.entity';
import { isBefore } from 'src/util/is-before';
import { Review } from 'src/reviews/review.entity';
import { BadRequestException } from '@nestjs/common';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column({
    type: 'time',
    nullable: false,
  })
  startTime: string;

  @Column({
    type: 'time',
    nullable: false,
  })
  endTime: string;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    nullable: false,
  })
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: BookingStatusEnum,
    nullable: false,
    default: BookingStatusEnum.INCOMPLETE,
  })
  status: BookingStatusEnum;

  @ManyToOne(() => Person, (person) => person.bookings)
  @JoinColumn()
  player: Person;

  @ManyToOne(() => Sport, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn()
  sport: Sport;

  @OneToMany(() => BookingSlot, (bookingSlot) => bookingSlot.booking)
  bookingSlots: BookingSlot[];

  @OneToOne(() => Payment, (payment) => payment.booking)
  payment: Payment;

  @OneToMany(
    () => AdditionalService,
    (additionalService) => additionalService.booking,
  )
  additionalServices: AdditionalService[];

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  guestName: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  guestPhone: string;

  @OneToOne(() => Review, (review) => review.booking)
  review: Review;

  @BeforeInsert()
  beforeInsert() {
    if (!isBefore) {
      throw new BadRequestException('Start time must be more than end time');
    }
  }
}
