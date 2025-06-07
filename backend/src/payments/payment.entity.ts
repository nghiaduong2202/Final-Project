import { UUID } from 'crypto';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Booking } from 'src/bookings/booking.entity';
import { Voucher } from 'src/vouchers/voucher.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column({
    type: 'integer',
    nullable: false,
  })
  fieldPrice: number;

  @Column({
    type: 'integer',
    nullable: true,
  })
  servicePrice?: number;

  @ManyToOne(() => Voucher, (voucher) => voucher.payments)
  @JoinColumn()
  voucher?: Voucher;

  @Column({
    type: 'integer',
    nullable: true,
  })
  discount?: number;

  @Column({
    type: 'integer',
    nullable: true,
    default: 0,
  })
  refund?: number;

  @Column({
    type: 'integer',
    nullable: true,
    default: 0,
  })
  refundedPoint?: number;

  @UpdateDateColumn({
    type: 'timestamptz',
    nullable: false,
  })
  updatedAt: Date;

  @OneToOne(() => Booking, (booking) => booking.payment, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  booking: Booking;
}
