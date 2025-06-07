import { UUID } from 'crypto';
import { Facility } from 'src/facilities/facility.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Certificate {
  @PrimaryColumn()
  facilityId: UUID;

  @Column({
    type: 'varchar',
    length: 255,
  })
  verified: string;

  @OneToOne(() => Facility, (facility) => facility.certificate, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  facility: Facility;
}
