import { UUID } from 'crypto';
import { Facility } from 'src/facilities/facility.entity';
import { Person } from 'src/people/person.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class FavortiteFacility {
  @PrimaryColumn()
  playerId: UUID;

  @PrimaryColumn()
  facilityId: UUID;

  @ManyToOne(() => Person, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'playerId',
  })
  player: Person;

  @ManyToOne(() => Facility, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'facilityId',
  })
  facility: Facility;
}
