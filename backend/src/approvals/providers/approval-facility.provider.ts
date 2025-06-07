import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ApprovalAbstract } from './approval.abstract';
import { UUID } from 'crypto';
import { Approval } from '../approval.entity';
import { CreateApprovalDto } from '../dtos/create-approval.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FacilityService } from 'src/facilities/facility.service';
import { ApprovalStatusEnum } from '../enums/approval-status.enum';
import { RejectNoteDto } from '../dtos/reject-note.dto';
import { ApprovalTypeEnum } from '../enums/approval-type.enum';
import { FacilityStatusEnum } from 'src/facilities/enums/facility-status.enum';
import { ElasticsearchService } from 'src/search/elasticsearch.service';

@Injectable()
export class ApprovalFacilityProvider implements ApprovalAbstract {
  /**
   * inject Logger
   */
  private readonly logger = new Logger(ApprovalFacilityProvider.name);

  constructor(
    /**
     * inject ApproveRopsitory
     */
    @InjectRepository(Approval)
    private readonly approveRepository: Repository<Approval>,
    /**
     * inject FacilityService
     */
    @Inject(forwardRef(() => FacilityService))
    private readonly facilityService: FacilityService,
    /**
     * inject DataSource
     */
    private readonly dataSource: DataSource,
    /**
     * inject ElasticsearchService
     */
    @Inject(forwardRef(() => ElasticsearchService))
    private readonly elasticsearchService: ElasticsearchService,
  ) {}

  public async createWithTransaction(
    facilityId: UUID,
    createApprovalDto: CreateApprovalDto,
    manager: EntityManager,
  ): Promise<Approval> {
    const facility = await this.facilityService.findOneByIdWithTransaction(
      facilityId,
      manager,
    );

    const approve = manager.create(Approval, {
      type: ApprovalTypeEnum.FACILITY,
      facility,
    });

    // maybe add notificate here, later

    return await manager.save(approve);
  }

  public async approve(approve: Approval): Promise<{ message: string }> {
    // get facility id
    let facilityId: UUID = approve.facility.id;

    await this.dataSource.transaction(async (manager) => {
      approve.status = ApprovalStatusEnum.APPROVED;

      const facility = await this.facilityService.findOneByIdWithTransaction(
        approve.facility.id,
        manager,
      );

      facilityId = facility.id;

      if (facility.status !== FacilityStatusEnum.PENDING) {
        throw new BadRequestException('The facility status must be pending');
      }

      facility.status = FacilityStatusEnum.ACTIVE;

      try {
        await manager.save(approve);
        await manager.save(facility);

        // Đẩy việc cập nhật Elasticsearch ra khỏi transaction chính để tăng tốc độ
        setTimeout(() => {
          // Không sử dụng async trong hàm setTimeout để tránh lỗi lint
          this.facilityService.getByFacility(facilityId)
            .then((facilityWithRelations) => {
              // Index facility đã load đầy đủ relations vào Elasticsearch
              this.elasticsearchService
                .indexFacility(facilityWithRelations)
                .catch((error: Error) => {
                  this.logger.error(
                    `Background elasticsearch indexing failed: ${error.message}`,
                    error.stack,
                  );
                });
            })
            .catch((err: Error) => {
              this.logger.error(
                `Failed to get facility with relations for indexing: ${err.message}`,
                err.stack,
              );
            });
        }, 0);
      } catch (error) {
        this.logger.error(
          'Failed to index approved facility to Elasticsearch:',
          error,
        );
        throw new BadRequestException(
          'An error occurred when approve the facility',
        );
      }
    });

    return {
      message: 'Approve the facility successful',
    };
  }

  public async reject(
    approval: Approval,
    rejectNoteDto: RejectNoteDto,
  ): Promise<{ message: string }> {
    // get facility id
    let facilityId: UUID = approval.facility.id;

    await this.dataSource.transaction(async (manager) => {
      approval.status = ApprovalStatusEnum.REJECTED;

      if (rejectNoteDto.note) {
        approval.note = rejectNoteDto.note;
      }

      const facility = await this.facilityService.findOneByIdWithTransaction(
        approval.facility.id,
        manager,
      );

      facilityId = facility.id;

      if (facility.status !== FacilityStatusEnum.PENDING) {
        throw new BadRequestException('The facility status must be pending');
      }

      facility.status = FacilityStatusEnum.UNACTIVE;

      try {
        await manager.save(approval);
        await manager.save(facility);

        // Đẩy việc cập nhật Elasticsearch ra khỏi transaction chính để tăng tốc độ
        setTimeout(() => {
          this.elasticsearchService
            .delete(this.elasticsearchService.getFacilitiesIndex(), facilityId)
            .catch((error: Error) => {
              this.logger.error(
                `Background elasticsearch deletion failed: ${error.message}`,
                error.stack,
              );
            });
        }, 0);
      } catch (error) {
        this.logger.error(
          'Failed to remove rejected facility from Elasticsearch:',
          error,
        );
        throw new BadRequestException(
          'An error occurred when reject the facility',
        );
      }
    });

    return {
      message: 'Reject the facility successful',
    };
  }
}
