import { UUID } from 'crypto';
import { Approval } from '../approval.entity';
import { CreateApprovalDto } from '../dtos/create-approval.dto';
import { RejectNoteDto } from '../dtos/reject-note.dto';
import { EntityManager } from 'typeorm';

export abstract class ApprovalAbstract {
  abstract createWithTransaction(
    facilityId: UUID,
    createApproveDto: CreateApprovalDto,
    manager: EntityManager,
  ): Promise<Approval>;

  abstract approve(approve: Approval): Promise<{ message: string }>;

  abstract reject(
    approve: Approval,
    rejectNoteDto: RejectNoteDto,
  ): Promise<{ message: string }>;
}
