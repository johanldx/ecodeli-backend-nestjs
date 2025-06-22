import { ApiProperty } from '@nestjs/swagger';

export class CurrentSubscriptionResponseDto {
  @ApiProperty({ description: 'The subscription details' })
  subscription: {
    id: number;
    name: string;
    description: string;
    price: number;
    stripe_id: string;
    created_at: Date;
    updated_at: Date;
  };

  @ApiProperty({ description: 'The subscription end date' })
  end_date: Date | null;

  @ApiProperty({ description: 'Whether the subscription is currently active' })
  is_active: boolean;
} 