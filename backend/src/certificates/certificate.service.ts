import { Injectable } from '@nestjs/common';
import { ICertificateService } from './icertificate.service';
import { Certificate } from './certificate.entity';
import { EntityManager } from 'typeorm';
import { CloudUploaderService } from 'src/cloud-uploader/cloud-uploader.service';
import { Facility } from 'src/facilities/facility.entity';

@Injectable()
export class CertificateService implements ICertificateService {
  constructor(
    /**
     * inject CloudUploaderService
     */
    private readonly cloudUploaderService: CloudUploaderService,
  ) {}

  public async createWithTransaction(
    certificate: Express.Multer.File,
    facility: Facility,
    manager: EntityManager,
  ): Promise<Certificate> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { secure_url } = await this.cloudUploaderService.upload(certificate);

    const newCertificate = manager.create(Certificate, {
      facility,
      verified: String(secure_url),
    });

    return await manager.save(newCertificate);
  }
}
