import { UUID } from 'crypto';
import { CreatePrizeDto } from './create-prize.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsUUID()
  facilityId: UUID;

  @ApiProperty({
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  images?: string[];

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  bannerImage: string;

  @ApiProperty({
    type: 'number',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  sportId: number;

  @ApiProperty({
    type: 'number',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  numberOfParticipant: number;

  @ApiProperty({
    type: 'boolean',
  })
  @IsNotEmpty()
  @IsBoolean()
  isGroup: boolean;

  @ApiProperty({
    type: 'string',
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    type: 'string',
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    type: 'string',
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endRegisterDate: Date;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  tournamentFormat: string;

  @ApiProperty({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  tournamentFormatDescription?: string;

  @ApiProperty({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  rule?: string;

  @ApiProperty({
    type: 'number',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  totalPrize: number;

  @ApiProperty({
    type: [CreatePrizeDto],
  })
  @IsOptional()
  @IsArray()
  @Type(() => CreatePrizeDto)
  @ValidateNested()
  prizeDtos?: CreatePrizeDto[];

  @ApiProperty({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  descriptionPrize?: string;

  @ApiProperty({
    type: 'boolean',
  })
  @IsNotEmpty()
  @IsBoolean()
  isFree: boolean;

  @ApiProperty({
    type: 'number',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  totalPayment: number;

  @ApiProperty({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  desciptionPayment?: string;
}
