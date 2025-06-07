import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IFavoriteFacility } from './ifavorite-facility.service';
import { UUID } from 'crypto';
import { Facility } from 'src/facilities/facility.entity';
import { Person } from 'src/people/person.entity';
import { Repository } from 'typeorm';
import { FavortiteFacility } from './favorite-facility.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FavoriteFacilityService implements IFavoriteFacility {
  constructor(
    /**
     * inject favoriteFacilityRepository
     */
    @InjectRepository(FavortiteFacility)
    private readonly favoriteFacilityRepository: Repository<FavortiteFacility>,
  ) {}

  public async create(
    facility: Facility,
    player: Person,
  ): Promise<{ message: string }> {
    try {
      const favoriteFacility = this.favoriteFacilityRepository.create({
        facility,
        player,
      });

      await this.favoriteFacilityRepository.save(favoriteFacility);
    } catch {
      throw new BadRequestException(
        'An error occurred when create favorite facility',
      );
    }

    return {
      message: 'Create favorite facility successful',
    };
  }

  public async delete(
    playerId: UUID,
    facilityId: UUID,
  ): Promise<{ message: string }> {
    const favoriteFacility = await this.favoriteFacilityRepository
      .findOneOrFail({
        where: {
          facilityId: facilityId,
          playerId: playerId,
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the favorite facility');
      });

    try {
      await this.favoriteFacilityRepository.remove(favoriteFacility);
    } catch {
      throw new BadRequestException(
        'An error occurred when delete favorite facility',
      );
    }

    return {
      message: 'Delete favorite facility successful',
    };
  }

  public async getByPlayer(playerId: UUID): Promise<Facility[]> {
    const favoriteFacilities = await this.favoriteFacilityRepository.find({
      relations: {
        facility: {
          fieldGroups: {
            sports: true,
          },
        },
      },
      where: {
        player: {
          id: playerId,
        },
      },
    });

    return favoriteFacilities.map(
      (favoriteFacility) => favoriteFacility.facility,
    );
  }
}
