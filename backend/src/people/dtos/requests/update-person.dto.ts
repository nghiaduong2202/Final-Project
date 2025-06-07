import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { GenderEnum } from '../../enums/gender.enum';
import { Type } from 'class-transformer';

export class UpdatePersonDto {
  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'Duong Van Nghia',
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'nghiaduong2202@gmail.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    type: 'string',
    example: '+84367459330',
  })
  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty({
    type: 'string',
    enum: GenderEnum,
    example: GenderEnum.MALE,
  })
  @IsEnum(GenderEnum)
  @IsOptional()
  gender?: GenderEnum;

  @ApiProperty({
    type: 'string',
    example: '2025-03-12T00:00:00.000Z',
  })
  @IsDateString()
  @Type(() => Date)
  @IsOptional()
  @ValidateNested()
  dob?: Date;

  @ApiProperty({
    type: 'string',
    example: '123456789',
  })
  @IsString()
  @IsOptional()
  bankAccount?: string;
}
