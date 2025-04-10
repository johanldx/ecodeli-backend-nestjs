import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionResponseDto {
  @ApiProperty({ description: 'The unique identifier for the subscription.' })
  id: number;

  @ApiProperty({ description: 'The name of the subscription plan.' })
  name: string;

  @ApiProperty({ description: 'A detailed description of the subscription plan.' })
  description: string;

  @ApiProperty({ description: 'The price of the subscription.' })
  price: number;

  @ApiProperty({ description: 'The Stripe payment system ID associated with the subscription.' })
  stripe_id: string;

  @ApiProperty({ description: 'Timestamp when the subscription was created.' })
  created_at: Date;

  @ApiProperty({ description: 'Timestamp when the subscription was last updated.' })
  updated_at: Date;
}
