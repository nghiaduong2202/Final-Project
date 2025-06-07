import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateFieldDto } from './create-field.dto';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UpdateFieldDto extends PartialType(CreateFieldDto) {
  @ApiProperty({
    type: 'number',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  id: number;
}
