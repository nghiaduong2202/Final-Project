import { ApiProperty } from '@nestjs/swagger';
import { CreateFieldDto } from './create-field.dto';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateManyFieldsDto {
  @ApiProperty({
    type: () => CreateFieldDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFieldDto)
  @IsNotEmpty()
  fields: CreateFieldDto[];
}
