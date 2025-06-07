import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsMilitaryTime,
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class GetAvailableFieldInFacilityDto {
  @ApiProperty({
    type: 'number',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  sportId: number;

  @ApiProperty({
    type: [Date],
    example: ['2025-04-20'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsDate({ each: true })
  @Type(() => Date)
  dates: Date[];

  @ApiProperty({
    type: 'string',
    example: '08:00',
  })
  @IsMilitaryTime()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    type: 'string',
    example: '10:00',
  })
  @IsMilitaryTime()
  @IsNotEmpty()
  endTime: string;
}
