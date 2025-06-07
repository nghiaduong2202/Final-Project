import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class GetScheduleDto {
  @ApiProperty({
    type: 'string',
    example: 'uuid code',
  })
  @IsNotEmpty()
  @IsUUID()
  fieldGroupId: UUID;

  @ApiProperty({
    type: 'string',
    example: '20225-04-23',
  })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  date: Date;
}
