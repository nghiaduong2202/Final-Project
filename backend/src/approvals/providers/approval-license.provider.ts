import { UUID } from 'crypto';
import { Approval } from '../approval.entity';
import { CreateApprovalDto } from '../dtos/create-approval.dto';
import { ApprovalAbstract } from './approval.abstract';
import { RejectNoteDto } from '../dtos/reject-note.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { SportService } from 'src/sports/sport.service';
import { FacilityService } from 'src/facilities/facility.service';
import { ApprovalStatusEnum } from '../enums/approval-status.enum';
import { License } from 'src/licenses/license.entity';
import { BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApprovalTypeEnum } from '../enums/approval-type.enum';
import { LicenseService } from 'src/licenses/license.service';

export class ApprovalLicenseProvider implements ApprovalAbstract {
  constructor(
    /**
     * inject SportService
     */
    private readonly sportService: SportService,
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
     * inject ApprovalRepository
     */
    @InjectRepository(Approval)
    private readonly approvalRepository: Repository<Approval>,
    /**
     * inject LicenseService
     */
    private readonly licenseService: LicenseService,
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

    const sport = await this.sportService.findOneByIdWithTransaction(
      createApprovalDto.sportId!,
      manager,
    );

    const approval = manager.create(Approval, {
      facility,
      sport,
      type: ApprovalTypeEnum.LICENSE,
      license: createApprovalDto.license,
    });

    return await manager.save(approval);
  }

  public async approve(approval: Approval): Promise<{ message: string }> {
    await this.dataSource.transaction(async (manager) => {
      approval.status = ApprovalStatusEnum.APPROVED;

      let license = await manager.findOne(License, {
        where: {
          facilityId: approval.facility.id,
          sportId: approval.sport?.id,
        },
      });

      if (!license) {
        license = await this.licenseService.createNoUploadWithTransction(
          approval.license!,
          approval.facility,
          approval.sport!.id,
          manager,
        );
      } else {
        license.verified = approval.license!;
      }

      try {
        await manager.save(approval);

        await manager.save(license);
      } catch {
        throw new BadRequestException('An error occurred');
      }
    });

    return {
      message: 'Approve the license of facility successful',
    };
  }

  public async reject(
    approval: Approval,
    rejectNoteDto: RejectNoteDto,
  ): Promise<{ message: string }> {
    approval.status = ApprovalStatusEnum.REJECTED;

    if (rejectNoteDto.note) {
      approval.note = rejectNoteDto.note;
    }

    await this.approvalRepository.save(approval);

    return {
      message: 'Reject the facility successful',
    };
  }
}
