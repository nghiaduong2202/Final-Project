import { Facility } from 'src/facilities/facility.entity';
import { License } from './license.entity';
import { EntityManager } from 'typeorm';
import { UUID } from 'crypto';

export interface ILicenseService {
  createWithTransaction(
    license: Express.Multer.File,
    facility: Facility,
    sportId: number,
    manager: EntityManager,
  ): Promise<License>;

  createNoUploadWithTransction(
    license: string,
    facility: Facility,
    sportId: number,
    manager: EntityManager,
  ): Promise<License>;

  findOneByIdWithTransaction(
    facilityId: UUID,
    sportId: number,
    manager: EntityManager,
  ): Promise<License>;

  findOneById(facilityId: UUID, sportId: number): Promise<License>;
}
