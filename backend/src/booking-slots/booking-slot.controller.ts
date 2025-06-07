import { Controller, Get } from '@nestjs/common';
import { BookingSlotService } from './booking-slot.service';
import { ApiOperation } from '@nestjs/swagger';
import { AuthRoles } from 'src/auths/decorators/auth-role.decorator';
import { AuthRoleEnum } from 'src/auths/enums/auth-role.enum';
import { ActivePerson } from 'src/auths/decorators/active-person.decorator';
import { UUID } from 'crypto';

@Controller('booking-slot')
export class BookingSlotController {
  constructor(
    /**
     * inject BookingSlotService
     */
    private readonly bookingSlotService: BookingSlotService,
  ) {}

  @ApiOperation({
    summary: 'get many booking slot for create playmate post (role: player)',
  })
  @Get('playmate')
  @AuthRoles(AuthRoleEnum.PLAYER)
  public getManyForPlaymate(@ActivePerson('sub') playerId: UUID) {
    return this.bookingSlotService.getManyForPlaymate(playerId);
  }
}
