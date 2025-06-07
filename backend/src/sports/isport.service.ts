import { EntityManager } from 'typeorm';
import { CreateSportDto } from './dtos/requests/create-sport.dto';
import { MessageResponseDto } from './dtos/responses/message-response.dto';
import { Sport } from './sport.entity';
import { UUID } from 'crypto';

export interface ISportService {
  create(createSportDto: CreateSportDto): Promise<MessageResponseDto>;

  getAll(): Promise<Sport[]>;

  findManyByIds(ids: number[]): Promise<Sport[]>;

  findOneByIdWithTransaction(
    sportId: number,
    manager: EntityManager,
  ): Promise<Sport>;

  findOneById(sportId: number): Promise<Sport>;

  getManyByFacility(facilityId: UUID): Promise<Sport[]>;
}
