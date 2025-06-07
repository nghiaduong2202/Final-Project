import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class ParticipantDto {
  @ApiProperty({
    type: 'string',
  })
  @IsUUID()
  @IsNotEmpty()
  eventId: UUID;

  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsUUID()
  playerId: UUID;
}
