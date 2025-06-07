import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class SendImagesDto {
  @IsUUID()
  @IsNotEmpty()
  conversationId: UUID;

  @IsString({ each: true })
  @IsArray()
  @IsNotEmpty()
  images: string[];
}
