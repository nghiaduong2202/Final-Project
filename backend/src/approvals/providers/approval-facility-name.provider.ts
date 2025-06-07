import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ApprovalAbstract } from './approval.abstract';
import { UUID } from 'crypto';
import { Approval } from '../approval.entity';
import { CreateApprovalDto } from '../dtos/create-approval.dto';
import { RejectNoteDto } from '../dtos/reject-note.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { FacilityService } from 'src/facilities/facility.service';
import { ApprovalTypeEnum } from '../enums/approval-type.enum';
import { ApprovalStatusEnum } from '../enums/approval-status.enum';
import { Certificate } from 'src/certificates/certificate.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ApprovalFacilityNameProvider implements ApprovalAbstract {
  constructor(
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
     * inject ApproveRepository
     */
    @InjectRepository(Approval)
    private readonly approvalRepository: Repository<Approval>,
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
      type: ApprovalTypeEnum.FACILITY_NAME,
      certifiacte: createApprovalDto.certificate,
      name: createApprovalDto.name,
    });

    // maybe add notificate here, later

    return await manager.save(approval);
  }

  public async approve(approval: Approval): Promise<{ message: string }> {
    await this.dataSource.transaction(async (manager) => {
      approval.status = ApprovalStatusEnum.APPROVED;

      const facility = await this.facilityService.findOneByIdWithTransaction(
        approval.facility.id,
        manager,
      );

      facility.name = approval.name!;

      const certifiacte = await manager
        .findOneOrFail(Certificate, {
          where: {
            facilityId: facility.id,
          },
        })
        .catch(() => {
          throw new BadRequestException('An error occurred');
        });

      certifiacte.verified = approval.certifiacte!;

      try {
        await manager.save(approval);

        await manager.save(facility);

        await manager.save(certifiacte);
      } catch {
        throw new BadRequestException('An error occurred');
      }
    });

    return {
      message: 'Approve the facility name successful',
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
