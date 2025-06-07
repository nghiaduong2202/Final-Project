import { UUID } from 'crypto';
import { Approval } from '../approval.entity';
import { CreateApprovalDto } from '../dtos/create-approval.dto';
import { ApprovalAbstract } from './approval.abstract';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RejectNoteDto } from '../dtos/reject-note.dto';
import { FacilityService } from 'src/facilities/facility.service';
import { ApprovalStatusEnum } from '../enums/approval-status.enum';
import { Certificate } from 'src/certificates/certificate.entity';
import { BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { ApprovalTypeEnum } from '../enums/approval-type.enum';

export class ApprovalCertificateProvider implements ApprovalAbstract {
  constructor(
    /**
     * inject ApproveProvider
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

    const approval = manager.create(Approval, {
      facility,
      type: ApprovalTypeEnum.CERTIFICATE,
      certifiacte: createApprovalDto.certificate,
    });

    // maybe add notificate here, later

    return await manager.save(approval);
  }

  public async approve(approval: Approval): Promise<{ message: string }> {
    await this.dataSource.transaction(async (manager) => {
      approval.status = ApprovalStatusEnum.APPROVED;

      const certificate = await manager
        .findOneOrFail(Certificate, {
          where: {
            facilityId: approval.facility.id,
          },
        })
        .catch(() => {
          throw new BadRequestException('An error occurred');
        });

      certificate.verified = approval.certifiacte!;

      try {
        await manager.save(approval);

        await manager.save(certificate);
      } catch {
        throw new BadRequestException('An error occurred');
      }
    });

    return {
      message: 'Approve the certificate of facility successful',
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

    await this.approveRepository.save(approval);

    return {
      message: 'Reject the facility successful',
    };
  }
}
