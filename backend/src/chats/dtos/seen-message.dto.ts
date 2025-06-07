import { IsNotEmpty, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class SeenMessageDto {
  @IsUUID()
  @IsNotEmpty()
  conversationId: UUID;

  @IsUUID()
  @IsNotEmpty()
  messageId: UUID;
}
