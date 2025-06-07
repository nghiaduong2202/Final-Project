import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsMilitaryTime,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateFieldGroupDto {
  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'Field group name',
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    type: 'string',
    example: '120x240',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  dimension?: string;

  @ApiProperty({
    type: 'string',
    example: 'mặt cỏ',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  surface?: string;

  @ApiProperty({
    type: 'number',
    example: 100000,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({
    type: 'string',
    example: '18:00',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsMilitaryTime()
  peakStartTime1?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: '21:00',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsMilitaryTime()
  peakEndTime1?: string;

  @ApiPropertyOptional({
    type: 'number',
    example: 50000,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceIncrease1?: number;

  @ApiPropertyOptional({
    type: 'string',
    example: '18:00',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsMilitaryTime()
  peakStartTime2?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: '21:00',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsMilitaryTime()
  peakEndTime2?: string;

  @ApiPropertyOptional({
    type: 'number',
    example: 50000,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceIncrease2?: number;

  @ApiPropertyOptional({
    type: 'string',
    example: '18:00',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsMilitaryTime()
  peakStartTime3?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: '21:00',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsMilitaryTime()
  peakEndTime3?: string;

  @ApiPropertyOptional({
    type: 'number',
    example: 50000,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceIncrease3?: number;

  @ApiProperty({
    type: 'array',
    example: [1, 2],
    nullable: true,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  sportIds: number[];
}
