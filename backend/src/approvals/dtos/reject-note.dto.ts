import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RejectNoteDto {
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  note?: string;
}
