import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreatePrizeDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  position: string;

  @ApiProperty({
    type: 'number',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  prize: number;
}
