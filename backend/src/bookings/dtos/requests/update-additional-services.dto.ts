import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { AdditionalServiceDto } from './additional-service.dto';
import { Type } from 'class-transformer';

export class UpdateAdditionalServicesDto {
  @ApiProperty({
    type: [AdditionalServiceDto],
  })
  @IsArray()
  @Type(() => AdditionalServiceDto)
  @ValidateNested()
  additionalServices: AdditionalServiceDto[];
}
