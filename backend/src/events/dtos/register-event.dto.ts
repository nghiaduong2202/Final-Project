import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class RegisterEventDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsUUID()
  eventId: UUID;

  @ApiProperty({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
