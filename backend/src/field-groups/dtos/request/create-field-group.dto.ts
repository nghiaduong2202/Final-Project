import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMilitaryTime,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateFieldDto } from 'src/fields/dtos/requests/create-field.dto';

export class CreateFieldGroupDto {
  @ApiProperty({
    type: 'string',
    example: 'Field group name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    type: 'string',
    example: '120x240',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  dimension: string;

  @ApiProperty({
    type: 'string',
    example: 'mặt cỏ',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  surface: string;

  @ApiProperty({
    type: 'number',
    example: 100000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  basePrice: number;

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
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  sportIds: number[];

  @ApiProperty({
    type: 'array',
    example: [{ name: 'field name' }],
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateFieldDto)
  fields: CreateFieldDto[];
}
