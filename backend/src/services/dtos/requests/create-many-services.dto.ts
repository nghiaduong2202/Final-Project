import { ApiProperty } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto';
import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UUID } from 'crypto';

export class CreateManyServicesDto {
  @ApiProperty({
    type: 'string',
    example: 'UUID code',
  })
  @IsNotEmpty()
  @IsUUID()
  facilityId: UUID;

  @ApiProperty({
    type: [CreateServiceDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceDto)
  services: CreateServiceDto[];
}
