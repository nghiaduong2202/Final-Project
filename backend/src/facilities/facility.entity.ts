import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { FacilityStatusEnum } from './enums/facility-status.enum';
import { UUID } from 'crypto';
import { FieldGroup } from 'src/field-groups/field-group.entity';
import { Person } from 'src/people/person.entity';
import { isBefore } from 'src/util/is-before';
import { Certificate } from 'src/certificates/certificate.entity';
import { License } from 'src/licenses/license.entity';
import { Service } from 'src/services/service.entity';
import { Voucher } from 'src/vouchers/voucher.entity';
import { Approval } from 'src/approvals/approval.entity';
import { BadRequestException } from '@nestjs/common';
import { Event } from 'src/events/entities/event.entity';

@Entity()
@Unique(['name', 'id'])
export class Facility {
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

  @Column({
    type: 'time',
    nullable: false,
  })
  openTime1: string;

  @Column({
    type: 'time',
    nullable: false,
  })
  closeTime1: string;

  @Column({
    type: 'time',
    nullable: true,
  })
  openTime2?: string;

  @Column({
    type: 'time',
    nullable: true,
  })
  closeTime2?: string;

  @Column({
    type: 'time',
    nullable: true,
  })
  openTime3?: string;

  @Column({
    type: 'time',
    nullable: true,
  })
  closeTime3?: string;

  @Column({
    type: 'integer',
    nullable: false,
    default: 1,
  })
  numberOfShifts: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  location: string;

  @Column({
    type: 'enum',
    enum: FacilityStatusEnum,
    nullable: false,
    default: FacilityStatusEnum.PENDING,
  })
  status: FacilityStatusEnum;

  @Column({
    type: 'real',
    nullable: false,
    default: 0.0,
  })
  avgRating: number;

  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
  })
  numberOfRating: number;

  @Column({
    type: 'varchar',
    length: 255,
    array: true,
    nullable: true,
  })
  imagesUrl?: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Service, (service) => service.facility)
  services: Service[];

  @OneToMany(() => Voucher, (voucher) => voucher.facility)
  vouchers: Voucher[];

  @OneToMany(() => FieldGroup, (fieldGroup) => fieldGroup.facility)
  fieldGroups: FieldGroup[];

  @ManyToOne(() => Person, (person) => person.facilities, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  owner: Person;

  @OneToOne(() => Certificate, (certificate) => certificate.facility)
  certificate: Certificate;

  @OneToMany(() => License, (license) => license.facility)
  licenses: License[];

  @OneToMany(() => Approval, (approvals) => approvals.facility)
  approvals: Approval[];

  @OneToMany(() => Event, (events) => events.facility)
  events: Event[];

  @BeforeInsert()
  @BeforeUpdate()
  beforeInsertAndUpdate() {
    /**
     * openTime > closeTime
     */
    if (!isBefore(this.openTime1, this.closeTime1)) {
      throw new BadRequestException('Open time must be before close time');
    }

    this.numberOfShifts = 1;

    if (this.openTime2 && this.closeTime2) {
      if (!isBefore(this.closeTime1, this.openTime2)) {
        throw new BadRequestException('Close time 1 must be before openTime 2');
      }

      if (!isBefore(this.openTime2, this.closeTime2)) {
        throw new BadRequestException('Open time must be before close time');
      }

      this.numberOfShifts = 2;

      if (this.openTime3 && this.closeTime3) {
        if (!isBefore(this.closeTime1, this.openTime2)) {
          throw new BadRequestException(
            'Close time 2 must be before openTime 3',
          );
        }

        if (!isBefore(this.openTime3, this.closeTime3)) {
          throw new BadRequestException('Open time must be before close time');
        }

        this.numberOfShifts = 3;
      }
    }
  }
}
