import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { UUID } from 'crypto';
import { CreatePlaymateDto } from './create-playmate.dto';

export class UpdatePlaymateDto extends PartialType(CreatePlaymateDto) {
  @ApiProperty({
    type: 'string',
  })
  @IsUUID()
  @IsNotEmpty()
  playmateId: UUID;
}
