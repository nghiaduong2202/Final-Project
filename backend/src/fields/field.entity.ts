import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { FieldStatusEnum } from './enums/field-status.enum';
import { FieldGroup } from 'src/field-groups/field-group.entity';
import { BookingSlot } from 'src/booking-slots/booking-slot.entity';

@Entity()
@Unique(['name', 'fieldGroup'])
export class Field {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: FieldStatusEnum,
    default: FieldStatusEnum.ACTIVE,
  })
  status: FieldStatusEnum;

  @ManyToOne(() => FieldGroup, (fieldGroup) => fieldGroup.fields, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  fieldGroup: FieldGroup;

  @OneToMany(() => BookingSlot, (bookingSlot) => bookingSlot.field)
  bookingSlots: BookingSlot[];
}
