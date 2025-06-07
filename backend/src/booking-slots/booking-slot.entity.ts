import { Booking } from 'src/bookings/booking.entity';
import { Field } from 'src/fields/field.entity';
import { Playmate } from 'src/playmates/entities/playmate.entity';
import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingSlotStatusEnum } from './enums/booking-slot-status.enum';

@Entity()
export class BookingSlot {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({
    type: 'date',
  })
  date: Date;

  @Column({
    type: 'enum',
    enum: BookingSlotStatusEnum,
    default: BookingSlotStatusEnum.UPCOMING,
  })
  status: BookingSlotStatusEnum;

  @ManyToOne(() => Field, (field) => field.bookingSlots, {
    nullable: false,
  })
  @JoinColumn()
  field: Field;

  @ManyToOne(() => Booking, (booking) => booking.bookingSlots, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  booking: Booking;

  @OneToOne(() => Playmate, (playmate) => playmate.bookingSlot)
  playmate: Playmate;

  @AfterLoad()
  afterLoad() {
    this.date = new Date(this.date);
  }
}
