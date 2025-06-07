import { UUID } from 'crypto';
import { Facility } from 'src/facilities/facility.entity';
import { Sport } from 'src/sports/sport.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class License {
  @PrimaryColumn()
  facilityId: UUID;

  @PrimaryColumn()
  sportId: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  verified: string;

  @ManyToOne(() => Facility, (facility) => facility.licenses, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  facility: Facility;

  @ManyToOne(() => Sport, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  sport: Sport;
}
