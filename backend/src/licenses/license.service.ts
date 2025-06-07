import { Injectable, NotFoundException } from '@nestjs/common';
import { ILicenseService } from './ilicense.service';
import { Facility } from 'src/facilities/facility.entity';
import { EntityManager, Repository } from 'typeorm';
import { License } from './license.entity';
import { CloudUploaderService } from 'src/cloud-uploader/cloud-uploader.service';
import { SportService } from 'src/sports/sport.service';
import { UUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class LicenseService implements ILicenseService {
  constructor(
    /**
     * inject cloudUploaderService
     */
    private readonly cloudUploaderService: CloudUploaderService,
    /**
     * inject SportService
     */
    private readonly sportService: SportService,
    /**
     * inject LicenseRepository
     */
    @InjectRepository(License)
    private readonly licenseRepository: Repository<License>,
  ) {}

  public async createWithTransaction(
    license: Express.Multer.File,
    facility: Facility,
    sportId: number,
    manager: EntityManager,
  ): Promise<License> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { secure_url } = await this.cloudUploaderService.upload(license);

    const sport = await this.sportService.findOneByIdWithTransaction(
      sportId,
      manager,
    );

    const newLicense = manager.create(License, {
      facility,
      sport,
      verified: String(secure_url),
    });

    return await manager.save(newLicense);
  }

  public async findOneByIdWithTransaction(
    facilityId: UUID,
    sportId: number,
    manager: EntityManager,
  ): Promise<License> {
    return await manager
      .findOneOrFail(License, {
        where: {
          sportId,
          facilityId,
        },
      })
      .catch(() => {
        throw new NotFoundException(
          `Not found license with sport ${sportId} of facility ${facilityId}`,
        );
      });
  }

  public async findOneById(
    facilityId: UUID,
    sportId: number,
  ): Promise<License> {
    return await this.licenseRepository
      .findOneOrFail({
        where: {
          sportId,
          facilityId,
        },
      })
      .catch(() => {
        throw new NotFoundException(
          `Not found license with sport ${sportId} of facility ${facilityId}`,
        );
      });
  }

  public async createNoUploadWithTransction(
    license: string,
    facility: Facility,
    sportId: number,
    manager: EntityManager,
  ): Promise<License> {
    const sport = await this.sportService.findOneByIdWithTransaction(
      sportId,
      manager,
    );

    const newLicense = manager.create(License, {
      facility,
      verified: license,
      sport,
    });

    return await manager.save(newLicense);
  }
}
