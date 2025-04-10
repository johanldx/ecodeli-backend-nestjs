import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryStepDto } from './create-delivery-step.dto';

export class UpdateDeliveryStepDto extends PartialType(CreateDeliveryStepDto) {}
