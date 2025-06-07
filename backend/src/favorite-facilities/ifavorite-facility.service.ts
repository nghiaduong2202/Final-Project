import { UUID } from 'crypto';
import { Facility } from 'src/facilities/facility.entity';
import { Person } from 'src/people/person.entity';

export interface IFavoriteFacility {
  create(facility: Facility, player: Person): Promise<{ message: string }>;
  delete(playerId: UUID, facilityId: UUID): Promise<{ message: string }>;
  getByPlayer(playerId: UUID): Promise<Facility[]>;
}
