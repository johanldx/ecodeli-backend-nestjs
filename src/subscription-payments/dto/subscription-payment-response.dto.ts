import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionPaymentResponseDto {
  @ApiProperty({ description: 'The unique identifier for the payment.' })
  id: number;

  @ApiProperty({ description: 'The amount of the subscription payment.' })
  amount: number;

  @ApiProperty({ description: 'The Stripe payment ID associated with the payment.' })
  stripe_payment_id: string;

  @ApiProperty({ description: 'The current status of the payment (pending, completed, failed).' })
  status: string;

  @ApiProperty({ description: 'The subscription that this payment is associated with.' })
  subscription_id: number;

  @ApiProperty({ description: 'Timestamp when the payment was created.' })
  created_at: Date;

  @ApiProperty({ description: 'Timestamp when the payment was last updated.' })
  updated_at: Date;
}
