import {
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GenderEnum } from './enums/gender.enum';
import { UUID } from 'crypto';
import { PersonRoleEnum } from './enums/person-role.enum';
import { Facility } from 'src/facilities/facility.entity';
import { Booking } from 'src/bookings/booking.entity';

@Entity()
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  password: string;

  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  phoneNumber?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  avatarUrl?: string;

  @Column({
    type: 'enum',
    enum: GenderEnum,
    nullable: true,
  })
  gender?: GenderEnum;

  @Column({
    type: 'date',
    nullable: true,
  })
  dob?: Date;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  bankAccount?: string;

  @Column({
    type: 'enum',
    enum: PersonRoleEnum,
    nullable: false,
    default: PersonRoleEnum.PLAYER,
  })
  role: PersonRoleEnum;

  @Column({
    type: 'int4',
    default: 0,
  })
  refundedPoint: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Facility, (facility) => facility.owner)
  facilities: Facility[];

  @OneToMany(() => Booking, (booking) => booking.player)
  bookings: Booking[];

  @AfterLoad()
  afterLoad() {
    if (this.dob) {
      this.dob = new Date(this.dob);
    }
  }
}
