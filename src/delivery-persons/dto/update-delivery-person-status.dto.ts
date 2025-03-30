import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidationStatus } from '../delivery-person.entity';

export class UpdateDeliveryPersonStatusDto {
  @ApiProperty({
    enum: ValidationStatus,
    description: 'New status of the delivery person',
  })
  @IsEnum(ValidationStatus)
  status: ValidationStatus;
}
