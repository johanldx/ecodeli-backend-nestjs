import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { PaymentStatus } from '../entities/subscription-payment.entity';

export class UpdateSubscriptionPaymentDto {
  @ApiProperty({ description: 'The amount of the subscription payment.' })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({
    description: 'The User id.',
  })
  @IsString()
  @IsOptional()
  userId?: number;

  @ApiProperty({ description: 'The status of the payment.' })
  @IsEnum(PaymentStatus)
  @IsOptional()
  status?: PaymentStatus;
}
