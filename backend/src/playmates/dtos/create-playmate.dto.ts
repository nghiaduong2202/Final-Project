import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { CostTypeEnum } from '../enums/cost-type.enum';
import { GenderPreferenceEnum } from '../enums/gender-preference.enum';
import { SkillLevelEnum } from '../enums/skill-level.enum';

export class CreatePlaymateDto {
  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    type: [String],
  })
  @IsUrl({}, { each: true })
  @IsArray()
  @IsOptional()
  imagesUrl?: string[];

  @ApiProperty({
    type: 'number',
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  bookingSlotId: number;

  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  description?: string;

  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsOptional()
  additionalInfor?: string;

  @ApiProperty({
    enum: CostTypeEnum,
    example: CostTypeEnum.TOTAL,
  })
  @IsEnum(CostTypeEnum)
  @IsNotEmpty()
  costType: CostTypeEnum;

  @ApiProperty({
    type: 'number',
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  totalCost?: number;

  @ApiProperty({
    type: 'number',
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  maleCost?: number;

  @ApiProperty({
    type: 'number',
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  femaleCost?: number;

  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsOptional()
  detailOfCost?: string;

  @ApiProperty({ type: 'boolean' })
  @IsBoolean()
  @IsNotEmpty()
  isTeam: boolean;

  @ApiProperty({
    type: 'number',
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  numberOfParticipants: number;

  @ApiProperty({
    enum: GenderPreferenceEnum,
    example: GenderPreferenceEnum.ANY,
  })
  @IsEnum(GenderPreferenceEnum)
  @IsNotEmpty()
  genderPreference: GenderPreferenceEnum;

  @ApiProperty({
    enum: SkillLevelEnum,
    example: SkillLevelEnum.ANY,
  })
  @IsEnum(SkillLevelEnum)
  @IsNotEmpty()
  skillLevel: SkillLevelEnum;

  @ApiProperty({
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  positions?: string[];
}
