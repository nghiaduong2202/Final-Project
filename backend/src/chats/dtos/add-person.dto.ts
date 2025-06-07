import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class AddPersonDto {
  @ApiProperty({
    type: 'string',
  })
  @IsUUID()
  @IsNotEmpty()
  personId: UUID;

  @ApiProperty({
    type: 'string',
  })
  @IsUUID()
  @IsNotEmpty()
  conversationId: UUID;
}
