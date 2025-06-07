import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { ApiOperation } from '@nestjs/swagger';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';
import { UUID } from 'crypto';
import { RejectNoteDto } from './dtos/reject-note.dto';
import { ActivePerson } from 'src/auths/decorators/active-person.decorator';

@Controller('approval')
export class ApprovalController {
  constructor(
    /**
     * inject ApproveService
     */
    private readonly approveSerice: ApprovalService,
  ) {}

  @ApiOperation({
    summary: 'approve the approval (role: admin)',
  })
  @Post(':approvalId/approve')
  @AuthRoles(AuthRoleEnum.ADMIN)
  public approve(@Param('approvalId', ParseUUIDPipe) approvalId: UUID) {
    return this.approveSerice.approve(approvalId);
  }

  @ApiOperation({
    summary: 'reject the approval (role: admin)',
  })
  @Post(':approvalId/reject')
  @AuthRoles(AuthRoleEnum.ADMIN)
  public reject(
    @Param('approvalId', ParseUUIDPipe) approvalId: UUID,
    @Body() rejectNoteDto: RejectNoteDto,
  ) {
    return this.approveSerice.reject(approvalId, rejectNoteDto);
  }

  @ApiOperation({
    summary: 'get all approval (role: admin)',
  })
  @Get('all')
  @AuthRoles(AuthRoleEnum.NONE)
  public getAll() {
    return this.approveSerice.getAll();
  }

  @ApiOperation({
    summary: 'delete approval (role: owner)',
  })
  @Delete(':approvalId')
  @AuthRoles(AuthRoleEnum.OWNER)
  public delete(
    @Param('approvalId', ParseUUIDPipe) approvalId: UUID,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.approveSerice.delete(approvalId, ownerId);
  }
}
