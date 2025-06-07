import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsMilitaryTime,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsPositive,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateBookingSlotDto } from 'src/booking-slots/dtos/requests/create-booking-slot.dto';

export class CreateDraftBookingByOwnerDto {
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
    type: CreateBookingSlotDto,
  })
  @IsNotEmpty()
  @Type(() => CreateBookingSlotDto)
  @ValidateNested()
  bookingSlot: CreateBookingSlotDto;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  guestName: string;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  guestPhone: string;

  @ApiProperty({
    type: 'number',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  sportId: number;
}
