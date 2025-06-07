import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IFacilityService } from './ifacility.service';
import { UUID } from 'crypto';
import { Facility } from './facility.entity';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFacilityDto } from './dtos/requests/create-facility.dto';
import { PersonService } from 'src/people/person.service';
import { FieldGroupService } from 'src/field-groups/field-group.service';
import { CertificateService } from 'src/certificates/certificate.service';
import { LicenseService } from 'src/licenses/license.service';
import { CloudUploaderService } from 'src/cloud-uploader/cloud-uploader.service';
import { FacilityStatusEnum } from './enums/facility-status.enum';
import { ApprovalService } from 'src/approvals/approval.service';
import { ApprovalTypeEnum } from 'src/approvals/enums/approval-type.enum';
import { SportService } from 'src/sports/sport.service';
import { DeleteImageDto } from './dtos/requests/delete-image.dto';
import { UpdateBaseInfo } from './dtos/requests/update-base-info.dto';
import { FavoriteFacilityService } from 'src/favorite-facilities/favorite-facility.service';
import { ElasticsearchService } from 'src/search/elasticsearch.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class FacilityService implements IFacilityService {
  private readonly logger = new Logger(FacilityService.name);

  constructor(
    /**
     * inject FacilityRepository
     */
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    /**
     * inject DataSource
     */
    private readonly dataSource: DataSource,
    /**
     * inject PersonService
     */
    private readonly personService: PersonService,
    /**
     * inject FieldGroupService
     */
    @Inject(forwardRef(() => FieldGroupService))
    private readonly fieldGroupService: FieldGroupService,
    /**
     * inject CertificateService
     */
    @Inject(forwardRef(() => CertificateService))
    private readonly certificateService: CertificateService,
    /**
     * inject LicenseService
     */
    @Inject(forwardRef(() => LicenseService))
    private readonly licenseService: LicenseService,
    /**
     * inject CloudUploaderService
     */
    private readonly cloudUploaderService: CloudUploaderService,
    /**
     * inject ApproveService
     */
    @Inject(forwardRef(() => ApprovalService))
    private readonly approvalService: ApprovalService,
    /**
     * inject SportService
     */
    private readonly sportService: SportService,
    /**
     * inject FavoriteFacilitytService
     */
    private readonly favoriteFacilityService: FavoriteFacilityService,
    /**
     * inject ElasticsearchService
     */
    @Inject(forwardRef(() => ElasticsearchService))
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  public async findOneByIdAndOwnerId(
    facilityId: UUID,
    ownerId: UUID,
  ): Promise<Facility> {
    return await this.facilityRepository
      .findOneOrFail({
        where: {
          id: facilityId,
          owner: {
            id: ownerId,
          },
        },
      })
      .catch(() => {
        throw new NotFoundException(
          `Not found facility by id: ${facilityId} of owner: ${ownerId}`,
        );
      });
  }

  public async create(
    createFacilityDto: CreateFacilityDto,
    images: Express.Multer.File[],
    ownerId: UUID,
    certificate: Express.Multer.File,
    licenses?: Express.Multer.File[],
    sportIds?: number[],
  ): Promise<{ message: string }> {
    // Khai báo biến createdFacility trước
    let createdFacility: Facility | null = null;

    await this.dataSource.transaction(async (manager) => {
      const owner = await this.personService.findOneByIdWithTransaction(
        ownerId,
        manager,
      );

      // create facility
      const facility = manager.create(Facility, {
        ...createFacilityDto,
        owner,
      });
      try {
        await manager.save(facility);
      } catch {
        throw new BadRequestException('An error occurred when create facility');
      }

      // create field groups
      for (const fieldGroup of createFacilityDto.fieldGroups) {
        await this.fieldGroupService.createWithTransaction(
          fieldGroup,
          facility,
          manager,
        );
      }

      // create certificate
      await this.certificateService.createWithTransaction(
        certificate,
        facility,
        manager,
      );

      if (sportIds && licenses) {
        if (sportIds.length !== licenses.length) {
          throw new BadRequestException(
            'sportIds and licenses must be the same length',
          );
        }

        const uniqueSportIds = new Set(sportIds);
        if (uniqueSportIds.size !== sportIds.length) {
          throw new BadRequestException('sportIds must be unique set');
        }

        for (let i = 0; i < licenses.length; i++) {
          await this.licenseService.createWithTransaction(
            licenses[i],
            facility,
            sportIds[i],
            manager,
          );
        }
      }

      // upload image
      const iamgesUrl: string[] = [];
      for (const image of images) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { secure_url } = await this.cloudUploaderService.upload(image);
        iamgesUrl.push(String(secure_url));
      }

      const newFacility = await manager
        .findOneOrFail(Facility, {
          where: {
            id: facility.id,
          },
        })
        .catch(() => {
          throw new BadRequestException();
        });

      newFacility.imagesUrl = iamgesUrl;

      await manager.save(newFacility);

      await this.approvalService.createWithTransaction(
        newFacility.id,
        ApprovalTypeEnum.FACILITY,
        {},
        manager,
      );

      // Lưu thông tin facility đã tạo để đồng bộ với Elasticsearch
      createdFacility = newFacility;
    });

    // Đồng bộ dữ liệu với Elasticsearch
    try {
      if (createdFacility) {
        await this.indexFacilityToElasticsearch(createdFacility);
      }
    } catch (error) {
      console.error('Failed to index facility to Elasticsearch', error);
    }

    return {
      message: 'Create facility successful',
    };
  }

  public async getAll(): Promise<any[]> {
    const facilities = await this.facilityRepository.find({
      relations: {
        owner: true,
        fieldGroups: {
          sports: true,
        },
      },
    });

    return facilities.map(({ fieldGroups, ...facility }) => ({
      ...facility,
      sports: fieldGroups
        .map((fieldGroup) => fieldGroup.sports)
        .flat()
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id),
        ),
    }));
  }

  public async getDropDownInfo(ownerId: UUID): Promise<any[]> {
    const facilities = await this.facilityRepository.find({
      relations: {
        fieldGroups: {
          sports: true,
        },
      },
      select: {
        id: true,
        name: true,
        fieldGroups: true,
      },
      where: {
        owner: {
          id: ownerId,
        },
        status: In([FacilityStatusEnum.ACTIVE, FacilityStatusEnum.CLOSED]),
      },
      order: {
        name: 'ASC',
      },
    });

    return facilities.map(({ fieldGroups, ...facility }) => ({
      ...facility,
      sports: fieldGroups
        .map((fieldGroup) => fieldGroup.sports)
        .flat()
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id),
        ),
    }));
  }

  public async getByOwner(ownerId: UUID): Promise<any[]> {
    const facilities = await this.facilityRepository.find({
      where: {
        owner: {
          id: ownerId,
        },
      },
      relations: {
        fieldGroups: {
          sports: true,
        },
      },
    });

    return facilities.map(({ fieldGroups, ...facility }) => ({
      ...facility,
      sports: fieldGroups
        .map((fieldGroup) => fieldGroup.sports)
        .flat()
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id),
        ),
      minPrice: Math.min(
        ...fieldGroups.map((fieldGroup) => fieldGroup.basePrice),
      ),
      maxPrice: Math.max(
        ...fieldGroups.map((fieldGroup) => fieldGroup.basePrice),
      ),
    }));
  }

  public async getByFacility(facilityId: UUID): Promise<any> {
    const facility = await this.facilityRepository
      .findOneOrFail({
        relations: {
          fieldGroups: {
            fields: true,
            sports: true,
          },
          owner: true,
          licenses: {
            sport: true,
          },
          certificate: true,
          approvals: true,
          services: true,
          vouchers: true,
        },
        where: {
          id: facilityId,
        },
        order: {
          name: 'ASC',
          approvals: {
            updatedAt: 'DESC',
          },
        },
      })
      .catch(() => {
        throw new NotFoundException(
          `Not found facility with id: ${facilityId}`,
        );
      });

    return {
      ...facility,
      minPrice: Math.min(
        ...facility.fieldGroups.map((fieldGroup) => fieldGroup.basePrice),
      ),
      maxPrice: Math.max(
        ...facility.fieldGroups.map((fieldGroup) => fieldGroup.basePrice),
      ),
    };
  }

  public async findOneById(facilityId: UUID): Promise<Facility> {
    return this.facilityRepository
      .findOneOrFail({
        where: {
          id: facilityId,
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the facility');
      });
  }

  public async findOneByIdWithTransaction(
    facilityId: UUID,
    manager: EntityManager,
  ): Promise<Facility> {
    return manager
      .findOneOrFail(Facility, {
        where: {
          id: facilityId,
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the facility');
      });
  }

  public async findOneByIdAndOwnerWithTransaction(
    facilityId: UUID,
    manager: EntityManager,
    ownerId: UUID,
  ): Promise<Facility> {
    return manager
      .findOneOrFail(Facility, {
        where: {
          id: facilityId,
          owner: {
            id: ownerId,
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the facility');
      });
  }

  public async updateName(
    facilityId: UUID,
    name: string,
    certificate: Express.Multer.File,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    let updatedFacility: Facility;

    await this.dataSource.transaction(async (manager) => {
      const facility = await this.findOneByIdAndOwnerWithTransaction(
        facilityId,
        manager,
        ownerId,
      );

      if (facility.status !== FacilityStatusEnum.ACTIVE) {
        throw new BadRequestException('The facility must be active');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { secure_url } =
        await this.cloudUploaderService.upload(certificate);

      await this.approvalService.createWithTransaction(
        facilityId,
        ApprovalTypeEnum.FACILITY_NAME,
        { name, certificate: String(secure_url) },
        manager,
      );
    });

    try {
      // Lấy facility đã cập nhật để đồng bộ với Elasticsearch
      updatedFacility = await this.findOneById(facilityId);
      await this.updateFacilityInElasticsearch(updatedFacility);
    } catch (error) {
      console.error('Failed to update facility in Elasticsearch', error);
    }

    return {
      message: 'Update name successful',
    };
  }

  public async updateCertificate(
    facilityId: UUID,
    certificate: Express.Multer.File,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    await this.dataSource.transaction(async (manager) => {
      const facility = await this.findOneByIdAndOwnerWithTransaction(
        facilityId,
        manager,
        ownerId,
      );

      if (facility.status !== FacilityStatusEnum.ACTIVE) {
        throw new BadRequestException('The facility must be active');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { secure_url } =
        await this.cloudUploaderService.upload(certificate);

      await this.approvalService.createWithTransaction(
        facilityId,
        ApprovalTypeEnum.CERTIFICATE,
        { certificate: String(secure_url) },
        manager,
      );
    });

    return {
      message: 'Update certificate successful',
    };
  }

  public async updateLicense(
    facilityId: UUID,
    sportId: number,
    license: Express.Multer.File,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    await this.dataSource.transaction(async (manager) => {
      const facility = await this.findOneByIdAndOwnerWithTransaction(
        facilityId,
        manager,
        ownerId,
      );

      await this.sportService.findOneByIdWithTransaction(sportId, manager);

      if (facility.status !== FacilityStatusEnum.ACTIVE) {
        throw new BadRequestException('The facility must be active');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { secure_url } = await this.cloudUploaderService.upload(license);

      await this.approvalService.createWithTransaction(
        facilityId,
        ApprovalTypeEnum.LICENSE,
        {
          license: String(secure_url),
          sportId,
        },
        manager,
      );
    });

    return {
      message: 'Update license successful',
    };
  }

  public async getExistingFacilityName(ownerId: UUID): Promise<string[]> {
    const facilities = await this.facilityRepository.find({
      where: {
        owner: {
          id: ownerId,
        },
      },
    });

    return facilities.map((facility) => facility.name);
  }

  public async addImages(
    facilityId: UUID,
    images: Express.Multer.File[],
    ownerId: UUID,
  ): Promise<{ message: string }> {
    const facility = await this.facilityRepository
      .findOneOrFail({
        where: {
          id: facilityId,
          owner: {
            id: ownerId,
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the facility');
      });

    for (const image of images) {
      if (!image.mimetype.includes('image')) {
        throw new BadRequestException('The files must be image type');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { secure_url } = await this.cloudUploaderService.upload(image);

      facility.imagesUrl?.push(String(secure_url));
    }

    try {
      await this.facilityRepository.save(facility);
    } catch {
      throw new BadRequestException(
        'An error occurred when add image into facility',
      );
    }

    return {
      message: 'Add image into facility successful',
    };
  }

  public async deleteImage(
    deleteImageDto: DeleteImageDto,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    const facility = await this.facilityRepository
      .findOneOrFail({
        where: {
          id: deleteImageDto.facilityId,
          owner: {
            id: ownerId,
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the facility');
      });

    facility.imagesUrl = facility.imagesUrl?.filter(
      (imageUrl) => imageUrl !== deleteImageDto.imageUrl,
    );

    try {
      await this.facilityRepository.save(facility);
    } catch {
      throw new BadRequestException('Delete the image in facility');
    }

    return {
      message: 'Delete image in facility successful',
    };
  }

  public async updateBaseInfo(
    facilityId: UUID,
    updateBaseInfo: UpdateBaseInfo,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    const facility = await this.findOneByIdAndOwnerId(facilityId, ownerId);

    if (updateBaseInfo.description)
      facility.description = updateBaseInfo.description;

    if (updateBaseInfo.openTime1) facility.openTime1 = updateBaseInfo.openTime1;

    if (updateBaseInfo.closeTime1)
      facility.closeTime1 = updateBaseInfo.closeTime1;

    if (updateBaseInfo.openTime2) facility.openTime2 = updateBaseInfo.openTime2;

    if (updateBaseInfo.closeTime2)
      facility.closeTime2 = updateBaseInfo.closeTime2;

    if (updateBaseInfo.openTime3) facility.openTime3 = updateBaseInfo.openTime3;

    if (updateBaseInfo.closeTime3)
      facility.closeTime3 = updateBaseInfo.closeTime3;

    try {
      await this.facilityRepository.save(facility);
    } catch (error) {
      throw new BadRequestException(String(error));
    }

    try {
      // Lấy facility đã cập nhật để đồng bộ với Elasticsearch
      const updatedFacility = await this.findOneById(facilityId);
      await this.updateFacilityInElasticsearch(updatedFacility);
    } catch (error) {
      console.error('Failed to update facility in Elasticsearch', error);
    }

    return {
      message: 'Update base info successful',
    };
  }

  public async getActiveTime(facilityId: UUID): Promise<any> {
    const facility = await this.facilityRepository
      .findOneOrFail({
        where: {
          id: facilityId,
        },
      })
      .catch(() => {
        throw new NotFoundException(`Not found facility by id: ${facilityId}`);
      });

    return {
      openTime1: facility.openTime1,
      closeTime1: facility.closeTime1,
      openTime2: facility.openTime2,
      closeTime2: facility.closeTime2,
      openTime3: facility.closeTime3,
      closeTime3: facility.closeTime3,
    };
  }

  public async findOneByField(fieldId: number): Promise<Facility> {
    return await this.facilityRepository
      .findOneOrFail({
        relations: {
          fieldGroups: true,
        },
        where: {
          fieldGroups: {
            fields: {
              id: fieldId,
            },
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the facility by field');
      });
  }

  public async getTopFacilities(): Promise<any[]> {
    const facilities = await this.facilityRepository.find({
      relations: {
        fieldGroups: {
          sports: true,
        },
      },
      order: {
        avgRating: 'DESC',
      },
      take: 8,
    });

    return facilities.map(({ fieldGroups, ...facility }) => ({
      ...facility,
      sports: fieldGroups
        .map((fieldGroup) => fieldGroup.sports)
        .flat()
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id),
        ),
      minPrice: Math.min(
        ...fieldGroups.map((fieldGroup) => fieldGroup.basePrice),
      ),
      maxPrice: Math.max(
        ...fieldGroups.map((fieldGroup) => fieldGroup.basePrice),
      ),
    }));
  }

  public async addRating(fieldId: number, rating: number): Promise<Facility> {
    const facility = await this.facilityRepository
      .findOneOrFail({
        where: {
          fieldGroups: {
            fields: {
              id: fieldId,
            },
          },
        },
      })
      .catch(() => {
        console.log('Loi khi add rating');
        return null;
      });

    facility!.avgRating =
      (facility!.avgRating * facility!.numberOfRating + rating) /
      (facility!.numberOfRating + 1);

    facility!.numberOfRating = facility!.numberOfRating + 1;

    try {
      await this.facilityRepository.save(facility!);
    } catch {
      console.log('Loi khi add rating');
    }

    try {
      // Lấy facility đã cập nhật để đồng bộ với Elasticsearch
      const updatedFacility = await this.findOneByField(fieldId);
      await this.updateFacilityInElasticsearch(updatedFacility);
    } catch (error) {
      console.error('Failed to update facility rating in Elasticsearch', error);
    }

    return facility!;
  }

  public async addFavorite(
    facilityId: UUID,
    playerId: UUID,
  ): Promise<{ message: string }> {
    const facility = await this.facilityRepository
      .findOneOrFail({
        where: {
          id: facilityId,
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the facility');
      });

    const player = await this.personService.findOneById(playerId);

    return this.favoriteFacilityService.create(facility, player);
  }

  public async deleteFavorite(
    facilityId: UUID,
    playerId: UUID,
  ): Promise<{ message: string }> {
    return await this.favoriteFacilityService.delete(playerId, facilityId);
  }

  public async getFavorite(playerId: UUID): Promise<any[]> {
    const facilities = await this.favoriteFacilityService.getByPlayer(playerId);

    return facilities.map(({ fieldGroups, ...facility }) => ({
      ...facility,
      sports: fieldGroups
        .map((fieldGroup) => fieldGroup.sports)
        .flat()
        .filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id),
        ),
      minPrice: Math.min(
        ...fieldGroups.map((fieldGroup) => fieldGroup.basePrice),
      ),
      maxPrice: Math.max(
        ...fieldGroups.map((fieldGroup) => fieldGroup.basePrice),
      ),
    }));
  }

  /**
   * Phương thức đồng bộ dữ liệu facility mới lên Elasticsearch
   */
  private async indexFacilityToElasticsearch(
    facility: Facility,
  ): Promise<void> {
    try {
      await this.elasticsearchService.indexFacility(facility);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to index facility: ${error.message}`);
      }
      throw new Error('Failed to index facility');
    }
  }

  /**
   * Phương thức cập nhật dữ liệu facility trên Elasticsearch
   */
  private async updateFacilityInElasticsearch(
    facility: Facility,
  ): Promise<void> {
    try {
      await this.elasticsearchService.indexFacility(facility);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to update facility in Elasticsearch: ${error.message}`,
        );
      }
      throw new Error('Failed to update facility in Elasticsearch');
    }
  }

  /**
   * Phương thức xóa dữ liệu facility khỏi Elasticsearch
   */
  private async deleteFacilityFromElasticsearch(
    facilityId: UUID,
  ): Promise<void> {
    try {
      await this.elasticsearchService.delete(
        this.elasticsearchService.getFacilitiesIndex(),
        facilityId.toString(),
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to delete facility from Elasticsearch: ${error.message}`,
        );
      }
      throw new Error('Failed to delete facility from Elasticsearch');
    }
  }

  /**
   * Phương thức đồng bộ tất cả facility lên Elasticsearch
   */
  public async syncAllFacilitiesToElasticsearch(): Promise<void> {
    this.logger.log('Synchronizing facilities to Elasticsearch');
    
    // Load facilities with all relations needed for complete data
    const facilities = await this.facilityRepository.find({
      relations: {
        fieldGroups: {
          fields: true,
          sports: true,
        },
        owner: true,
        licenses: {
          sport: true,
        },
        certificate: true,
        services: true,
        vouchers: true,
      },
      order: {
        name: 'ASC',
      },
    });

    if (facilities.length === 0) {
      this.logger.log('No facilities found to synchronize');
      return;
    }

    // Transform facilities to include minPrice and maxPrice like getByFacility does
    const processedFacilities = facilities.map((facility) => ({
      ...facility,
      minPrice: facility.fieldGroups.length > 0 
        ? Math.min(...facility.fieldGroups.map((fieldGroup) => fieldGroup.basePrice))
        : 0,
      maxPrice: facility.fieldGroups.length > 0
        ? Math.max(...facility.fieldGroups.map((fieldGroup) => fieldGroup.basePrice))
        : 0,
    }));
    
    try {
      await this.elasticsearchService.bulkIndex(
        this.elasticsearchService.getFacilitiesIndex(),
        processedFacilities,
      );
      this.logger.log(`Synchronized ${facilities.length} facilities to Elasticsearch`);
    } catch (error: unknown) {
      this.logger.error('Failed to sync facilities to Elasticsearch', error);
      if (error instanceof Error) {
        throw new Error(
          `Failed to sync facilities to Elasticsearch: ${error.message}`,
        );
      }
      throw new Error('Failed to sync facilities to Elasticsearch');
    }
  }

  // Sau mỗi lần cập nhật thông tin của facility, đồng bộ dữ liệu vào Elasticsearch
  private async syncFacilityToElasticsearch(facilityId: UUID) {
    try {
      const facility = await this.findOneById(facilityId);
      if (facility) {
        await this.elasticsearchService.indexFacility(facility);
        console.log(`Synchronized facility ${facilityId} to Elasticsearch`);
      }
    } catch (error) {
      console.error(`Failed to sync facility ${facilityId} to Elasticsearch:`, error);
    }
  }
}