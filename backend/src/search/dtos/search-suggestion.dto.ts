import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum SuggestionType {
  NAME = 'name',
  LOCATION = 'location',
  ALL = 'all'
}

export class SearchSuggestionDto {
  @ApiProperty({
    description: 'The prefix text to get suggestions for',
    example: 'san',
    required: true
  })
  @IsString()
  prefix: string;

  @ApiProperty({
    description: 'Type of suggestion to retrieve: name, location, or all',
    enum: SuggestionType,
    default: SuggestionType.ALL,
    required: false
  })
  @IsEnum(SuggestionType)
  @IsOptional()
  type?: SuggestionType = SuggestionType.ALL;

  @ApiProperty({
    description: 'Maximum number of suggestions to return',
    example: 5,
    default: 5,
    required: false
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(20)
  size?: number = 5;
} 