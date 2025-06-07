import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class CreateConversationDto {
  @ApiProperty({
    type: 'string',
  })
  @IsUUID()
  @IsNotEmpty()
  personId: UUID;
}
