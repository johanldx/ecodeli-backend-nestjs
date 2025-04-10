import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'The name of the subscription plan.' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'A detailed description of the subscription plan.' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'The price of the subscription.' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ description: 'The Stripe payment system ID associated with the subscription.' })
  @IsString()
  @IsNotEmpty()
  stripe_id: string;
}
