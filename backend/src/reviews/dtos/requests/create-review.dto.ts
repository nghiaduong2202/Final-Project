import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { UUID } from 'crypto';

export class CreateReviewDto {
  @ApiProperty({
    type: 'number',
    example: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(5)
  rating: number;

  @ApiProperty({
    type: 'string',
    example: 'very good',
  })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({
    type: 'string',
    example: 'uuid code',
  })
  @IsUUID()
  @IsNotEmpty()
  bookingId: UUID;
}
