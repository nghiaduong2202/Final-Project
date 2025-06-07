import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMilitaryTime,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateFieldGroupDto } from 'src/field-groups/dtos/request/create-field-group.dto';

export class CreateFacilityDto {
  @ApiProperty({
    type: 'string',
    example: 'Facility name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'Facility description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    type: 'string',
    example: '6:00',
  })
  @IsString()
  @IsNotEmpty()
  @IsMilitaryTime()
  openTime1: string;

  @ApiProperty({
    type: 'string',
    example: '22:00',
  })
  @IsMilitaryTime()
  @IsString()
  @IsNotEmpty()
  closeTime1: string;

  @ApiProperty({
    type: 'string',
    example: '6:00',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @IsMilitaryTime()
  openTime2?: string;

  @ApiProperty({
    type: 'string',
    example: '22:00',
    nullable: true,
  })
  @IsMilitaryTime()
  @IsString()
  @IsOptional()
  closeTime2?: string;

  @ApiProperty({
    type: 'string',
    example: '6:00',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @IsMilitaryTime()
  openTime3?: string;

  @ApiProperty({
    type: 'string',
    example: '22:00',
    nullable: true,
  })
  @IsMilitaryTime()
  @IsString()
  @IsOptional()
  closeTime3?: string;

  @ApiProperty({
    type: 'string',
    example: 'Facility location',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    type: [CreateFieldGroupDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFieldGroupDto)
  fieldGroups: CreateFieldGroupDto[];
}
