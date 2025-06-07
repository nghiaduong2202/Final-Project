import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
export class UpdateReviewDto {
  @ApiProperty({
    type: 'number',
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  reviewId: number;

  @ApiProperty({
    type: 'number',
    example: 3,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiProperty({
    type: 'string',
    example: 'not bad',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    type: [String],
  })
  @IsUrl({}, { each: true })
  @IsArray()
  @IsNotEmpty()
  imageUrl: string[];
}
