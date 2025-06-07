import { UUID } from 'crypto';
import { Approval } from './approval.entity';
import { CreateApprovalDto } from './dtos/create-approval.dto';
import { RejectNoteDto } from './dtos/reject-note.dto';
import { ApprovalTypeEnum } from './enums/approval-type.enum';
import { EntityManager } from 'typeorm';

export interface IApprovalService {
  createWithTransaction(
    facilityId: UUID,
    approvalType: ApprovalTypeEnum,
    createApproveDto: CreateApprovalDto,
    manager: EntityManager,
  ): Promise<Approval>;

  approve(approveId: UUID): Promise<{ message: string }>;

  reject(
    approveId: UUID,
    rejectNoteDto: RejectNoteDto,
  ): Promise<{ message: string }>;

  findOneById(approveId: UUID): Promise<Approval>;

  getAll(): Promise<Approval[]>;

  delete(approvalId: UUID, ownerId: UUID): Promise<{ message: string }>;
}
