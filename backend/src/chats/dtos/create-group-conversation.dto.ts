import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UUID } from 'crypto';

export class CreateGroupConversationDto {
  @ApiProperty({
    type: [String],
  })
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(2)
  members: UUID[];

  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(255)
  title: string;
}
