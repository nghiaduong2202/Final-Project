import { ApiOperation, ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { PaymentOptionEnum } from 'src/payments/enums/payment-option.enum';

export class PaymentDto {
  @ApiProperty({
    type: 'number',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  voucherId?: number;

  @ApiProperty({
    type: 'string',
    enum: PaymentOptionEnum,
    example: PaymentOptionEnum.VNPAY,
  })
  @IsNotEmpty()
  @IsEnum(PaymentOptionEnum)
  paymentOption: PaymentOptionEnum;

  @ApiProperty({
    type: 'number',
    example: 10,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  refundedPoint?: number;
}
