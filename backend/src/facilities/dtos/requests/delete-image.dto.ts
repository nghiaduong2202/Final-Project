import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class DeleteImageDto {
  @ApiProperty({
    type: 'string',
    example: 'uuid code',
  })
  @IsUUID()
  @IsNotEmpty()
  facilityId: UUID;

  @ApiProperty({
    type: 'string',
    example: 'https://....',
  })
  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;
}
