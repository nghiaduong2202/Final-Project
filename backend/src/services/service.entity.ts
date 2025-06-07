import { BadRequestException } from '@nestjs/common';
import { Facility } from 'src/facilities/facility.entity';
import { Sport } from 'src/sports/sport.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ServiceTypeEnum } from './enums/service-type.enum';
import { AdditionalService } from 'src/additional-services/additional-service.entity';
import { UnitEnum } from './enums/unit.enum';

@Entity()
@Unique(['name', 'facility'])
export class Service {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'integer',
    nullable: false,
  })
  price: number;

  @Column({
    type: 'enum',
    enum: ServiceTypeEnum,
    nullable: false,
  })
  type: ServiceTypeEnum;

  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
  })
  amount: number;

  @Column({
    type: 'integer',
    nullable: false,
    default: 0,
  })
  bookedCount: number;

  @Column({
    type: 'enum',
    enum: UnitEnum,
    nullable: false,
  })
  unit: UnitEnum;

  @ManyToOne(() => Sport, {
    onDelete: 'RESTRICT',
    nullable: false,
  })
  @JoinColumn()
  sport: Sport;

  @ManyToOne(() => Facility, (facility) => facility.services, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  facility: Facility;

  @OneToMany(
    () => AdditionalService,
    (additionalService) => additionalService.service,
  )
  additionalServices: AdditionalService[];

  @BeforeUpdate()
  @BeforeInsert()
  beforeUpdateAndInsert() {
    /**
     * amount must be more than or equal to 0
     */
    if (this.amount < 0) {
      throw new BadRequestException(
        'Amount of service must be more than or equal to 0',
      );
    }
  }
}
