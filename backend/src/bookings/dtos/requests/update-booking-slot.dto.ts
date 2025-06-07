import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateBookingSlotDto } from 'src/booking-slots/dtos/requests/create-booking-slot.dto';

export class UpdateBookingSlotDto {
  @ApiProperty({
    type: [CreateBookingSlotDto],
  })
  @IsArray()
  @Type(() => CreateBookingSlotDto)
  @ValidateNested()
  bookingSlots: CreateBookingSlotDto[];
}
