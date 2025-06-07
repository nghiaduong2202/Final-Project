import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsMilitaryTime,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBookingSlotDto } from 'src/booking-slots/dtos/requests/create-booking-slot.dto';

export class CreateDraftBookingDto {
  @ApiProperty({
    type: 'string',
    example: '06:00',
  })
  @IsMilitaryTime()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    type: 'string',
    example: '08:00',
  })
  @IsNotEmpty()
  @IsMilitaryTime()
  endTime: string;

  @ApiProperty({
    type: [CreateBookingSlotDto],
  })
  @IsNotEmpty()
  @IsArray()
  @Type(() => CreateBookingSlotDto)
  @ValidateNested()
  bookingSlots: CreateBookingSlotDto[];

  @ApiProperty({
    type: 'number',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  sportId: number;
}
