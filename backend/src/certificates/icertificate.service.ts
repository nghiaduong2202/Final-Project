import { EntityManager } from 'typeorm';
import { Certificate } from './certificate.entity';
import { Facility } from 'src/facilities/facility.entity';

export interface ICertificateService {
  createWithTransaction(
    certificate: Express.Multer.File,
    facility: Facility,
    manager: EntityManager,
  ): Promise<Certificate>;
}
