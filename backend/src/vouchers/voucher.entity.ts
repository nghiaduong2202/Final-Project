import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VoucherTypeEnum } from './enums/voucher-type.enum';
import { Facility } from 'src/facilities/facility.entity';
import { BadRequestException } from '@nestjs/common';
import { Payment } from 'src/payments/payment.entity';

@Entity()
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'date',
    nullable: false,
  })
  startDate: Date;

  @Column({
    type: 'date',
    nullable: false,
  })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: VoucherTypeEnum,
    nullable: false,
  })
  voucherType: VoucherTypeEnum;

  @Column({
    type: 'real',
    nullable: false,
    default: 0,
  })
  discount: number;

  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  minPrice: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  maxDiscount?: number;

  @Column({
    type: 'int',
    nullable: false,
  })
  amount: number;

  @Column({
    type: 'int',
    nullable: false,
  })
  remain: number;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Facility, (facility) => facility.vouchers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  facility: Facility;

  @OneToMany(() => Payment, (payments) => payments.voucher)
  payments: Payment[];

  @BeforeInsert()
  beforeInsert() {
    this.remain = this.amount;
  }

  @BeforeInsert()
  @BeforeUpdate()
  beforeInsertAnUpdate() {
    /**
     * startDate must be more than or equal to endDate
     */
    if (this.startDate.valueOf() > this.endDate.valueOf()) {
      throw new BadRequestException('startDate must be more than endDate');
    }

    /**
     * if voucherType was percent then discount must be less than or equal 100
     */
    if (this.voucherType === VoucherTypeEnum.PERCENT && this.discount > 100) {
      throw new BadRequestException('Discount must be less than 100');
    }
  }

  @AfterLoad()
  afterLoad() {
    this.startDate = new Date(this.startDate);
    this.endDate = new Date(this.endDate);
  }
}
