import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PersonRoleEnum } from 'src/people/enums/person-role.enum';

export class RegisterDto {
  @ApiProperty({
    type: 'string',
    example: 'nghiaduong2202@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    type: 'string',
    example: '+84367459330',
  })
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    type: 'string',
    example: 'Duong Van Nghia',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    type: 'string',
    example: '',
  })
  @Matches(/^[A-Z][a-zA-Z0-9@!*]+$/, { message: 'Wrong format password' })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @ApiProperty({
    type: 'string',
    enum: PersonRoleEnum,
    example: PersonRoleEnum.PLAYER,
  })
  @IsEnum(PersonRoleEnum)
  @IsNotEmpty()
  role: PersonRoleEnum;
}
