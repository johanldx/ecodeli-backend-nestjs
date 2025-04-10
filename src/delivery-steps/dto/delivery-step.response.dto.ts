import { ApiProperty } from '@nestjs/swagger';
import { DeliveryStepStatus } from '../entities/delivery-step.entity';

export class DeliveryStepResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  receivedBy: number;

  @ApiProperty()
  deliveryAdId: number;

  @ApiProperty()
  stepNumber: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  departureLocation: number;

  @ApiProperty()
  arrivalLocation: number;

  @ApiProperty({ enum: DeliveryStepStatus })
  status: DeliveryStepStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  editedAt: Date;
}
