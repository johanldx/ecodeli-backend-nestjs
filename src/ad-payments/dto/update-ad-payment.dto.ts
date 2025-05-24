import { IsEnum, IsOptional } from 'class-validator';
import { PaymentStatus } from '../entities/payment.enums';

export class UpdateAdPaymentDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
