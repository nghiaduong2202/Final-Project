import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateFieldGroupDto } from './create-field-group.dto';

export class CreateManyFieldGroupsDto {
  @ApiProperty({
    type: () => CreateFieldGroupDto,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFieldGroupDto)
  fieldGroups: CreateFieldGroupDto[];
}
