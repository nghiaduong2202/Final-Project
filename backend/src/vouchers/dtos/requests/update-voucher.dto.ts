import { PartialType } from '@nestjs/swagger';
import { CreateVoucherDto } from './create-voucher.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateVoucherDto extends PartialType(CreateVoucherDto) {
  @ApiProperty({
    type: 'number',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
