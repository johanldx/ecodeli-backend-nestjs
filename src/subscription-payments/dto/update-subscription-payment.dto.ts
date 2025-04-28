import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { PaymentStatus } from '../entities/subscription-payment.entity';

export class UpdateSubscriptionPaymentDto {
  @ApiProperty({ description: 'The amount of the subscription payment.' })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: 'The Stripe payment ID associated with the payment.',
  })
  @IsString()
  @IsOptional()
  stripe_payment_id?: string;

  @ApiProperty({ description: 'The status of the payment.' })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;
}
