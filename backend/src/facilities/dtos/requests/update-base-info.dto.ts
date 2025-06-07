import { ApiProperty } from '@nestjs/swagger';
import { IsMilitaryTime, IsOptional, IsString } from 'class-validator';

export class UpdateBaseInfo {
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
  @IsOptional()
  @IsMilitaryTime()
  openTime1?: string;

  @ApiProperty({
    type: 'string',
    example: '22:00',
  })
  @IsMilitaryTime()
  @IsString()
  @IsOptional()
  closeTime1?: string;

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
}
