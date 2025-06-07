import { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApprovalTypeEnum } from './enums/approval-type.enum';
import { ApprovalStatusEnum } from './enums/approval-status.enum';
import { Facility } from 'src/facilities/facility.entity';
import { Sport } from 'src/sports/sport.entity';

@Entity()
export class Approval {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column({
    type: 'enum',
    enum: ApprovalTypeEnum,
    nullable: false,
  })
  type: ApprovalTypeEnum;

  @Column({
    type: 'enum',
    enum: ApprovalStatusEnum,
    default: ApprovalStatusEnum.PENDING,
    nullable: false,
  })
  status: ApprovalStatusEnum;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  certifiacte?: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  license?: string;

  @ManyToOne(() => Sport, {
    nullable: true,
  })
  @JoinColumn()
  sport?: Sport;

  @Column({
    type: 'text',
    nullable: true,
  })
  note?: string;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date;

  @ManyToOne(() => Facility, (facility) => facility.approvals)
  @JoinColumn()
  facility: Facility;
}
