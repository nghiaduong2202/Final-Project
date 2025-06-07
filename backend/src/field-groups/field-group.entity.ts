import { BadRequestException } from '@nestjs/common';
import { UUID } from 'crypto';
import { Facility } from 'src/facilities/facility.entity';
import { Field } from 'src/fields/field.entity';
import { Sport } from 'src/sports/sport.entity';
import { isBefore } from 'src/util/is-before';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['name', 'facility'])
export class FieldGroup {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  dimension: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  surface: string;

  @Column({
    type: 'integer',
    nullable: false,
  })
  basePrice: number;

  @Column({
    type: 'time',
    nullable: true,
  })
  peakStartTime1?: string;

  @Column({
    type: 'time',
    nullable: true,
  })
  peakEndTime1?: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  priceIncrease1?: number;
  @Column({
    type: 'time',
    nullable: true,
  })
  peakStartTime2?: string;

  @Column({
    type: 'time',
    nullable: true,
  })
  peakEndTime2?: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  priceIncrease2?: number;
  @Column({
    type: 'time',
    nullable: true,
  })
  peakStartTime3?: string;

  @Column({
    type: 'time',
    nullable: true,
  })
  peakEndTime3?: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  priceIncrease3?: number;

  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
  })
  numberOfPeaks: number;

  @OneToMany(() => Field, (field) => field.fieldGroup)
  fields: Field[];

  @ManyToOne(() => Facility, (facility) => facility.fieldGroups, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  facility: Facility;

  @ManyToMany(() => Sport, (sport) => sport.fieldGroups)
  @JoinTable()
  sports: Sport[];

  @BeforeInsert()
  @BeforeUpdate()
  beforeInsertAndUpdate() {
    if (this.peakEndTime1 && this.peakStartTime1) {
      if (!isBefore(this.peakStartTime1, this.peakEndTime1)) {
        throw new BadRequestException(
          'Peak start time must be before peak end time',
        );
      }

      this.numberOfPeaks = 1;
    }

    if (this.peakEndTime2 && this.peakStartTime2) {
      if (!isBefore(this.peakStartTime2, this.peakEndTime2)) {
        throw new BadRequestException(
          'Peak start time must be before peak end time',
        );
      }

      this.numberOfPeaks = 2;
    }

    if (this.peakEndTime3 && this.peakStartTime3) {
      if (!isBefore(this.peakStartTime3, this.peakEndTime3)) {
        throw new BadRequestException(
          'Peak start time must be before peak end time',
        );
      }

      this.numberOfPeaks = 3;
    }
  }
}
