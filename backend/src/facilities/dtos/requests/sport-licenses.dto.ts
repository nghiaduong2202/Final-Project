import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class SportLicensesDto {
  @ApiProperty({
    type: 'array',
    example: [1, 2],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  sportIds?: number[];
}
