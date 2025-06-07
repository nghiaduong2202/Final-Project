import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';
import { UUID } from 'crypto';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  eventId: UUID;
}
