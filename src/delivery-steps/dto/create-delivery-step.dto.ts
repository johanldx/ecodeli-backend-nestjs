import { IsString, IsNumber, IsEnum } from 'class-validator';
import { DeliveryStepStatus } from '../entities/delivery-step.entity';

export class CreateDeliveryStepDto {
  @IsNumber()
  readonly stepNumber: number;

  @IsNumber()
  readonly price: number;

  @IsEnum(DeliveryStepStatus)
  readonly status: DeliveryStepStatus;

  @IsNumber()
  readonly deliveryAdId: number;
}
