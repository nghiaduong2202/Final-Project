import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ServiceTypeEnum } from '../../enums/service-type.enum';
import { UnitEnum } from 'src/services/enums/unit.enum';

export class CreateServiceDto {
  @ApiProperty({
    type: 'string',
    example: 'Service name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    type: 'number',
    example: '10000',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    type: 'string',
    nullable: true,
    example: 'Service description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: 'number',
    example: '20',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    type: 'number',
    example: '1',
  })
  @IsNotEmpty()
  @IsNumber()
  sportId: number;

  @ApiProperty({
    type: 'string',
    enum: UnitEnum,
    example: UnitEnum.TIME,
  })
  @IsEnum(UnitEnum)
  @IsNotEmpty()
  unit: UnitEnum;

  @ApiProperty({
    type: 'string',
    enum: ServiceTypeEnum,
    example: ServiceTypeEnum.OTHER,
  })
  @IsNotEmpty()
  @IsEnum(ServiceTypeEnum)
  type: ServiceTypeEnum;
}
