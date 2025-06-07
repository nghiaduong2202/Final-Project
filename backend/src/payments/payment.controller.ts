import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UUID } from 'crypto';
import { PaymentDto } from './dtos/requests/payment.dto';
import { ActivePerson } from 'src/auths/decorators/active-person.decorator';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';
import { Request } from 'express';
import { GenerateMonthlyReportDto } from './dtos/requests/generate-monthly-report.dto';

@Controller('payment')
export class PaymentController {
  constructor(
    /**
     * inject PaymentService
     */
    private readonly paymentService: PaymentService,
  ) {}

  @ApiOperation({
    summary: 'payment for booking (role: player)',
  })
  @Put(':paymentId')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public payment(
    @Param('paymentId', ParseUUIDPipe) paymentId: UUID,
    @Body() paymentDto: PaymentDto,
    @ActivePerson('sub') playerId: UUID,
    @Req() req: Request,
  ) {
    return this.paymentService.payment(paymentId, paymentDto, playerId, req);
  }

  @ApiOperation({
    summary: 'owner payment for booking (role: owner)',
  })
  @Put(':paymentId/owner')
  @AuthRoles(AuthRoleEnum.OWNER)
  public ownerPayment(
    @Param('paymentId', ParseUUIDPipe) paymentId: UUID,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.paymentService.ownerPayment(paymentId, ownerId);
  }

  @ApiOperation({
    summary: 'verify ipn response',
  })
  @Get('ipn')
  @AuthRoles(AuthRoleEnum.NONE)
  public ipn(@Req() req: Request) {
    return this.paymentService.ipn(req);
  }

  @ApiOperation({
    summary: 'get all information for display finance report (role: owner)',
  })
  @ApiQuery({
    name: 'facility',
    type: 'string',
  })
  @Post('monthly-report')
  @AuthRoles(AuthRoleEnum.OWNER)
  generateMonthlyReport(
    @Body() generateMonthlyReportDto: GenerateMonthlyReportDto,
    @ActivePerson('sub') ownerId: UUID,
    @Query(
      'facility',
      new ParseUUIDPipe({
        optional: true,
      }),
    )
    facilityId?: UUID,
  ) {
    return this.paymentService.generateMonthlyReport(
      generateMonthlyReportDto,
      ownerId,
      facilityId,
    );
  }
}
