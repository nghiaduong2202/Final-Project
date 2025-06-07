import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class GenerateMonthlyReportDto {
  @ApiProperty({
    type: 'number',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  month: number;

  @ApiProperty({
    type: 'number',
  })
  @IsNumber()
  @Min(2023)
  @IsNotEmpty()
  year: number;
}
