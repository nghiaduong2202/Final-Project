import { UUID } from 'crypto';
import { BookingSlot } from 'src/booking-slots/booking-slot.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlaymateParticipant } from './playmate-participant.entity';
import { BadRequestException } from '@nestjs/common';
import { CostTypeEnum } from '../enums/cost-type.enum';
import { GenderPreferenceEnum } from '../enums/gender-preference.enum';
import { SkillLevelEnum } from '../enums/skill-level.enum';

@Entity()
export class Playmate {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column({
    type: 'text',
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 255,
    array: true,
    nullable: true,
  })
  imagesUrl?: string[];

  @OneToOne(() => BookingSlot, (bookingSlot) => bookingSlot.playmate, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  bookingSlot: BookingSlot;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  additionalInfo?: string;

  @Column({
    type: 'enum',
    enum: CostTypeEnum,
    nullable: false,
  })
  costType: CostTypeEnum;

  @Column({
    type: 'integer',
    nullable: true,
  })
  totalCost?: number;

  @Column({
    type: 'integer',
    nullable: true,
  })
  maleCost?: number;

  @Column({
    type: 'integer',
    nullable: true,
  })
  femaleCost?: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  detailOfCost?: string;

  @Column({
    type: 'bool',
    default: false,
  })
  isTeam: boolean;

  @Column({
    type: 'integer',
    nullable: false,
  })
  numberOfParticipants: number;

  @Column({
    type: 'varchar',
    length: 255,
    array: true,
    nullable: true,
  })
  positions?: string[];

  @Column({
    type: 'enum',
    enum: GenderPreferenceEnum,
    default: GenderPreferenceEnum.ANY,
  })
  genderPreference: GenderPreferenceEnum;

  @Column({
    type: 'enum',
    enum: SkillLevelEnum,
    default: SkillLevelEnum.ANY,
  })
  skillLevel: SkillLevelEnum;

  @OneToMany(() => PlaymateParticipant, (participants) => participants.playmate)
  participants: PlaymateParticipant[];

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  beforeInsertAndUpdate() {
    if (this.costType === CostTypeEnum.TOTAL && !this.totalCost) {
      throw new BadRequestException('Miss total cost');
    }

    if (
      this.costType === CostTypeEnum.GENDER &&
      (!this.maleCost || !this.femaleCost)
    ) {
      throw new BadRequestException('Miss male or female cost');
    }
  }
}
