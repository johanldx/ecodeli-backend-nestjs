import { IsEnum, IsNumber } from 'class-validator';
import { PaymentTypes } from '../entities/payment.enums';

export class CreateAdPaymentDto {
  @IsNumber()
  amount: number;

  @IsEnum(PaymentTypes)
  payment_type: PaymentTypes;

  @IsNumber()
  reference_id: number;
}
