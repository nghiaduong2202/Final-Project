import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ISportService } from './isport.service';
import { CreateSportDto } from './dtos/requests/create-sport.dto';
import { MessageResponseDto } from './dtos/responses/message-response.dto';
import { EntityManager, In, Repository } from 'typeorm';
import { Sport } from './sport.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';

@Injectable()
export class SportService implements ISportService {
  constructor(
    /**
     * inject SportRepositoty
     */
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
  ) {}

  public async create(
    createSportDto: CreateSportDto,
  ): Promise<MessageResponseDto> {
    try {
      const sport = this.sportRepository.create(createSportDto);

      await this.sportRepository.save(sport);
    } catch {
      throw new BadRequestException('Error occur when create new sport');
    }

    return {
      message: 'Create sport successful',
    };
  }

  public async getAll(): Promise<Sport[]> {
    return await this.sportRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  public async findManyByIds(ids: number[]): Promise<Sport[]> {
    return this.sportRepository.find({
      where: {
        id: In(ids),
      },
    });
  }

  public async findOneByIdWithTransaction(
    sportId: number,
    manager: EntityManager,
  ): Promise<Sport> {
    return await manager
      .findOneOrFail(Sport, {
        where: {
          id: sportId,
        },
      })
      .catch(() => {
        throw new NotFoundException(`Not found sport by id: ${sportId}`);
      });
  }

  public async findOneById(sportId: number): Promise<Sport> {
    return this.sportRepository
      .findOneOrFail({
        where: {
          id: sportId,
        },
      })
      .catch(() => {
        throw new NotFoundException(`Not found the sport by id: ${sportId}`);
      });
  }

  public async getManyByFacility(facilityId: UUID): Promise<Sport[]> {
    return this.sportRepository.find({
      where: {
        fieldGroups: {
          facility: {
            id: facilityId,
          },
        },
      },
    });
  }
}
