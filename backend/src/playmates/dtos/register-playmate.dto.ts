import { UUID } from 'crypto';
import { SkillLevelEnum } from '../enums/skill-level.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class RegisterPlaymateDto {
  @ApiProperty({
    type: 'string',
  })
  @IsUUID()
  @IsNotEmpty()
  playmateId: UUID;

  @ApiProperty({
    type: 'string',
    example: SkillLevelEnum.ANY,
  })
  @IsEnum(SkillLevelEnum)
  @IsNotEmpty()
  skillLevel: SkillLevelEnum;

  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({
    type: 'string',
  })
  @IsOptional()
  @IsString()
  position?: string;
}
