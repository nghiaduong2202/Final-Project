import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';
import { UUID } from 'crypto';

export class SendMessageDto {
  @IsUUID()
  @IsNotEmpty()
  conversationId: UUID;

  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  content: string;
}
