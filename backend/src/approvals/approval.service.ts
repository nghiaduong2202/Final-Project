import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UUID } from 'crypto';
import { CreateApprovalDto } from './dtos/create-approval.dto';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApprovalFacilityProvider } from './providers/approval-facility.provider';
import { ApprovalFacilityNameProvider } from './providers/approval-facility-name.provider';
import { ApprovalCertificateProvider } from './providers/approval-certificate.provider';
import { ApprovalLicenseProvider } from './providers/approval-license.provider';
import { ApprovalTypeEnum } from './enums/approval-type.enum';
import { RejectNoteDto } from './dtos/reject-note.dto';
import { ApprovalStatusEnum } from './enums/approval-status.enum';
import { IApprovalService } from './iapproval.service';
import { Approval } from './approval.entity';
import { FacilityStatusEnum } from 'src/facilities/enums/facility-status.enum';
@Injectable()
export class ApprovalService implements IApprovalService {
  constructor(
    /**
     * inject ApproveRepository
     */
    @InjectRepository(Approval)
    private readonly approveRepository: Repository<Approval>,
    /**
     * inject ApproveFacilityProvider
     */
    private readonly approvalFacilityProvider: ApprovalFacilityProvider,
    /**
     * inject ApproveFacilityNameProvider
     */
    private readonly approvalFacilityNameProvider: ApprovalFacilityNameProvider,
    /**
     * inject ApproveCertificateProvider
     */
    private readonly approvalCertificateProvider: ApprovalCertificateProvider,
    /**
     * inject ApproveLicenseProvider
     */
    private readonly approvalLicenseProvider: ApprovalLicenseProvider,
  ) {}

  public async createWithTransaction(
    facilityId: UUID,
    approvalType: ApprovalTypeEnum,
    createApprovalDto: CreateApprovalDto,
    manager: EntityManager,
  ): Promise<Approval> {
    switch (approvalType) {
      case ApprovalTypeEnum.FACILITY:
        return await this.approvalFacilityProvider.createWithTransaction(
          facilityId,
          createApprovalDto,
          manager,
        );

      case ApprovalTypeEnum.FACILITY_NAME:
        return await this.approvalFacilityNameProvider.createWithTransaction(
          facilityId,
          createApprovalDto,
          manager,
        );

      case ApprovalTypeEnum.CERTIFICATE:
        return await this.approvalCertificateProvider.createWithTransaction(
          facilityId,
          createApprovalDto,
          manager,
        );

      case ApprovalTypeEnum.LICENSE:
        return await this.approvalLicenseProvider.createWithTransaction(
          facilityId,
          createApprovalDto,
          manager,
        );
      default:
        throw new BadRequestException('An error occurred');
    }
  }

  public async approve(approvalId: UUID): Promise<{ message: string }> {
    const approval = await this.findOneById(approvalId);

    if (approval.status !== ApprovalStatusEnum.PENDING) {
      throw new BadRequestException('Approval must be pendding');
    }

    switch (approval.type) {
      case ApprovalTypeEnum.FACILITY:
        return await this.approvalFacilityProvider.approve(approval);

      case ApprovalTypeEnum.FACILITY_NAME:
        if (approval.facility.status !== FacilityStatusEnum.ACTIVE) {
          throw new BadRequestException('The facility must be active');
        }

        return await this.approvalFacilityNameProvider.approve(approval);

      case ApprovalTypeEnum.CERTIFICATE:
        if (approval.facility.status !== FacilityStatusEnum.ACTIVE) {
          throw new BadRequestException('The facility must be active');
        }

        return await this.approvalCertificateProvider.approve(approval);

      case ApprovalTypeEnum.LICENSE:
        if (approval.facility.status !== FacilityStatusEnum.ACTIVE) {
          throw new BadRequestException('The facility must be active');
        }

        return await this.approvalLicenseProvider.approve(approval);
      default:
        throw new BadRequestException('An error occurred');
    }
  }

  public async reject(
    approvalId: UUID,
    rejectNoteDto: RejectNoteDto,
  ): Promise<{ message: string }> {
    const approval = await this.findOneById(approvalId);

    if (approval.status !== ApprovalStatusEnum.PENDING) {
      throw new BadRequestException('approval must be pendding');
    }

    switch (approval.type) {
      case ApprovalTypeEnum.FACILITY:
        return await this.approvalFacilityProvider.reject(
          approval,
          rejectNoteDto,
        );

      case ApprovalTypeEnum.FACILITY_NAME:
        if (approval.facility.status !== FacilityStatusEnum.ACTIVE) {
          throw new BadRequestException('The facility must be active');
        }

        return await this.approvalFacilityNameProvider.reject(
          approval,
          rejectNoteDto,
        );

      case ApprovalTypeEnum.CERTIFICATE:
        if (approval.facility.status !== FacilityStatusEnum.ACTIVE) {
          throw new BadRequestException('The facility must be active');
        }

        return await this.approvalCertificateProvider.reject(
          approval,
          rejectNoteDto,
        );

      case ApprovalTypeEnum.LICENSE:
        if (approval.facility.status !== FacilityStatusEnum.ACTIVE) {
          throw new BadRequestException('The facility must be active');
        }

        return await this.approvalLicenseProvider.reject(
          approval,
          rejectNoteDto,
        );
      default:
        throw new BadRequestException('An error occurred');
    }
  }

  public async findOneById(approveId: UUID): Promise<Approval> {
    return await this.approveRepository
      .findOneOrFail({
        relations: {
          facility: true,
          sport: true,
        },
        where: {
          id: approveId,
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the approve');
      });
  }

  public async getAll(): Promise<Approval[]> {
    return this.approveRepository.find({
      relations: {
        facility: {
          certificate: true,
          licenses: true,
          fieldGroups: {
            fields: true,
            sports: true,
          },
        },
        sport: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  public async delete(
    approvalId: UUID,
    ownerId: UUID,
  ): Promise<{ message: string }> {
    const approval = await this.approveRepository
      .findOneOrFail({
        where: {
          id: approvalId,
          facility: {
            owner: {
              id: ownerId,
            },
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('Not found the approval');
      });

    if (approval.status !== ApprovalStatusEnum.PENDING) {
      throw new BadRequestException('The approval must be pending');
    }

    await this.approveRepository.remove(approval);

    return {
      message: 'Delete the approval successful',
    };
  }
}
