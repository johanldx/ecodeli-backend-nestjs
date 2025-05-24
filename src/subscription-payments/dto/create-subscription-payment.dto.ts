import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { PaymentStatus } from '../entities/subscription-payment.entity';

export class CreateSubscriptionPaymentDto {
  @ApiProperty({ description: 'The amount of the subscription payment.' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'The status of the payment.' })
  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;

  @ApiProperty({
    description: 'The ID of the subscription associated with this payment.',
  })
  @IsNumber()
  @IsNotEmpty()
  subscriptionId: number;
}
