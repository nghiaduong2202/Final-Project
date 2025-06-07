import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { ApiOperation } from '@nestjs/swagger';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';
import { CreateVoucherDto } from './dtos/requests/create-voucher.dto';
import { UUID } from 'crypto';
import { ActivePerson } from 'src/auths/decorators/active-person.decorator';
import { UpdateVoucherDto } from './dtos/requests/update-voucher.dto';

@Controller('voucher')
export class VoucherController {
  constructor(
    /**
     * inject VoucherService
     */
    private readonly voucherService: VoucherService,
  ) {}

  @ApiOperation({
    summary: 'create voucher (role: owner)',
  })
  @Post(':facilityId')
  @AuthRoles(AuthRoleEnum.OWNER)
  public create(
    @Body() createVoucherDto: CreateVoucherDto,
    @Param('facilityId', ParseUUIDPipe) facilityId: UUID,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.voucherService.create(createVoucherDto, facilityId, ownerId);
  }

  @ApiOperation({
    summary: 'delete vvoucher (role: owner)',
  })
  @Delete(':voucherId')
  @AuthRoles(AuthRoleEnum.OWNER)
  public delete(
    @Param('voucherId') voucherId: number,
    @ActivePerson('sub') ownerId: UUID,
  ) {
    return this.voucherService.delete(voucherId, ownerId);
  }

  @ApiOperation({
    summary: 'update voucher (role: owner)',
  })
  @Patch()
  @AuthRoles(AuthRoleEnum.OWNER)
  public update(
    @Body() updateVoucherDto: UpdateVoucherDto,
    @ActivePerson('sub') ownerID: UUID,
  ) {
    return this.voucherService.update(updateVoucherDto, ownerID);
  }

  @ApiOperation({
    summary: 'get six voucher (role: none)',
  })
  @Get('six-vouchers')
  @AuthRoles(AuthRoleEnum.NONE)
  public getSixVouchers() {
    return this.voucherService.getSixVouchers();
  }

  @ApiOperation({
    summary: 'get voucher by facility (role: none)',
  })
  @Get(':facilityId')
  @AuthRoles(AuthRoleEnum.NONE)
  public getByFacility(@Param('facilityId', ParseUUIDPipe) facilityId: UUID) {
    return this.voucherService.getByFacility(facilityId);
  }
}
