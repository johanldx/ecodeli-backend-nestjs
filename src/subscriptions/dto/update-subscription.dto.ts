import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateSubscriptionDto {
  @ApiProperty({ description: 'The name of the subscription plan.' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'A detailed description of the subscription plan.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'The price of the subscription.' })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({ description: 'The Stripe payment system ID associated with the subscription.' })
  @IsString()
  @IsOptional()
  stripe_id?: string;
}
