import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    type: 'string',
    example: 'nghiaduong2202@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: 'string',
    example: 'Abc0367458310@',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(/^[A-Z][a-zA-Z0-9@!*]+$/, { message: 'Wrong format password' })
  @IsNotEmpty()
  password: string;
}
