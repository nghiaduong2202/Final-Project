import { BadRequestException } from '@nestjs/common';
import { Booking } from 'src/bookings/booking.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({
    type: 'int',
    nullable: false,
  })
  rating: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  comment?: string;

  @Column({
    type: 'varchar',
    length: 255,
    array: true,
    nullable: true,
  })
  imageUrl: string[];

  @CreateDateColumn({
    type: 'timestamptz',
  })
  reviewAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  feedbackAt: Date;

  @Column({
    type: 'text',
    nullable: true,
  })
  feedback?: string;

  @OneToOne(() => Booking, (booking) => booking.review, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  booking: Booking;

  @BeforeInsert()
  @BeforeUpdate()
  beforeInsertAndUpdate() {
    if (this.rating > 5 && this.rating < 0) {
      throw new BadRequestException(
        'The rating score must be more than 0 and less than 5',
      );
    }
  }
}
